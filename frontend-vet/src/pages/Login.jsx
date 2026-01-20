
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth';

import fondoblanco from '../assets/fondoblanco.jpg';
import panecillo from '../pages/Imagenes/panecillo.jpg';
import politicasPdf from '../assets/Politicas_QuitoEmprende.pdf';

/** Derivación segura si el backend no manda estadoUI */
function deriveEstadoUIFront(status, estado_Emprendedor) {
  if (status === false) return 'Suspendido';
  const e = estado_Emprendedor || 'Activo';
  return ['Advertencia1', 'Advertencia2', 'Advertencia3', 'Suspendido'].includes(e) ? e : 'Correcto';
}

const estadoMensajesBase = {
  Advertencia1:
    'Tu cuenta tiene una advertencia. Por favor revisa las políticas y evita futuras infracciones.',
  Advertencia2:
    'Tu cuenta tiene dos advertencias. Si reincides, podrías ser suspendido.',
  Advertencia3:
    'Tu cuenta está en advertencia grave. Estás a un paso de la suspensión.',
  Suspendido:
    'Tu cuenta está suspendida. No puedes acceder. Contacta a soporte para más información.',
};

/** Config de contacto administrador */
const ADMIN_EMAIL = 'sebasj@outlook.com';
const ADMIN_WHATS = '0984523160';
const ADMIN_COUNTRY_CODE = '593'; // Cambia si el número no es de Ecuador
const DEFAULT_SUPPORT_MSG = 'Hola, necesito ayuda con mi cuenta.';

/** Normaliza número local a formato internacional para wa.me */
function buildWhatsLink(localNumber, countryCode = '593', text = '') {
  const onlyDigits = String(localNumber).replace(/\D/g, '');
  const noLeadingZero = onlyDigits.replace(/^0+/, '');
  const international = `${countryCode}${noLeadingZero}`;
  const base = `https://wa.me/${international}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [estadoBanner, setEstadoBanner] = useState(null);

  const {
    token, setToken, setRol, setId,
    setEstadoUI, setEstadoInterno, setStatus,
    setUltimaAdvertencia, clearToken
  } = storeAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Capturar datos desde OAuth si vinieran
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const rolFromUrl   = query.get('rol');
    const idFromUrl    = query.get('id');

    if (tokenFromUrl && rolFromUrl && idFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      setId(idFromUrl);
      navigate('/dashboard');
    }
  }, [location.search, setToken, setRol, setId, navigate]);

  // Redirigir si ya hay token (sesión previa)
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const loginUser = async (data) => {
    setEstadoBanner(null);
    try {
      let endpoint = '';
      switch (data.role) {
        case 'admin':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/administradores/login`;
          break;
        case 'user':   // Cliente
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/clientes/login`;
          break;
        case 'editor': // Emprendedor
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/emprendedores/login`;
          break;
        default:
          toast.error('Selecciona un rol válido');
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('No existen estos datos para el rol seleccionado');
      }

      const result = await response.json();

      // 🚫 Manejo de suspensión (403)
      if (!response.ok) {
        if (response.status === 403 && (result?.estadoUI === 'Suspendido' || result?.status === false)) {
          clearToken();
          const ultima = result?.ultimaAdvertencia;
          const motivoTxt = ultima?.motivo ? ` Motivo: ${ultima.motivo}.` : '';
          const fechaTxt  = ultima?.fecha ? ` (${new Date(ultima.fecha).toLocaleString()})` : '';
          setEstadoBanner({
            tipo: 'Suspendido',
            msg: `${estadoMensajesBase['Suspendido']}${motivoTxt}${fechaTxt}`
          });
          toast.error(result?.msg || estadoMensajesBase['Suspendido']);
          return;
        }
        throw new Error(result?.msg || 'Credenciales incorrectas');
      }

      // ✅ Persistir credenciales base
      const roleMap = { admin: 'Administrador', editor: 'Emprendedor', user: 'Cliente' };
      setToken(result.token);
      setRol(roleMap[data.role] || result.rol);
      setId(result._id);

      // ✅ Persistir estado (usa lo que venga; si no, deriva)
      const estadoUIResp      = result?.estadoUI ?? deriveEstadoUIFront(result?.status, result?.estado_Emprendedor);
      const estadoInternoResp = result?.estado_Emprendedor ?? 'Activo';
      const statusResp        = typeof result?.status === 'boolean' ? result.status : true;

      setEstadoUI(estadoUIResp);
      setEstadoInterno(estadoInternoResp);
      setStatus(statusResp);

      // 🆕 Persistir y mostrar última advertencia si aplica
      const ultima = result?.ultimaAdvertencia || null;
      setUltimaAdvertencia(ultima || null);

      if (['Advertencia1', 'Advertencia2', 'Advertencia3', 'Suspendido'].includes(estadoUIResp)) {
        const base = estadoMensajesBase[estadoUIResp];
        const motivoTxt = ultima?.motivo ? ` Motivo: ${ultima.motivo}.` : '';
        const fechaTxt  = ultima?.fecha ? ` (${new Date(ultima.fecha).toLocaleString()})` : '';
        setEstadoBanner({ tipo: estadoUIResp, msg: `${base}${motivoTxt}${fechaTxt}` });
      }

      // Bloqueo si suspendido (no guardar sesión efectiva)
      if (estadoUIResp === 'Suspendido' || statusResp === false) {
        clearToken();
        return;
      }

      toast.success('Inicio de sesión exitoso');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado');
    }
  };

  const GOOGLE_CLIENT_URL      = 'https://backend-production-bd1d.up.railway.app/auth/google/cliente';
  const GOOGLE_EMPRENDEDOR_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/emprendedor';

  /** Links de contacto (dinámicos) */
  const mailHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('Soporte de cuenta')}&body=${encodeURIComponent(DEFAULT_SUPPORT_MSG)}`;
  const waHref   = buildWhatsLink(ADMIN_WHATS, ADMIN_COUNTRY_CODE, DEFAULT_SUPPORT_MSG);

  return (
    <div style={containerStyle}>
      <ToastContainer />

      {/* Animación + responsividad */}
      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
        }
        /* Responsivo */
        @media (max-width: 900px) {
          .login-card {
            flex-direction: column;
            height: auto;
            max-width: 95%;
          }
          .login-left {
            height: 220px;
            border-radius: 0;
          }
          .login-form {
            padding: 1.25rem !important;
          }
        }
      `}</style>

      <div style={backgroundStyle} />
      <Bubbles />

      <div className="login-card" style={cardStyle}>
        {/* Imagen lateral */}
        <div className="login-left" style={leftPanelStyle}>
          <img
            src={panecillo}
            alt="Panecillo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '5%',
              border: '8px solid white',
            }}
          />
        </div>

        {/* Formulario */}
        <div className="login-form" style={formContainerStyle}>
          {/* Banner arriba del título */}
          {estadoBanner && (
            <div
              className={`mb-4 p-3 rounded-lg text-center font-semibold text-base
                ${estadoBanner.tipo === 'Suspendido'
                  ? 'bg-red-100 border border-red-400 text-red-800'
                  : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
                }`}
              style={{ wordBreak: 'break-word' }}
            >
              {/* Mensaje principal */}
              <div style={{ marginBottom: '0.5rem' }}>{estadoBanner.msg}</div>

              {/* ✅ Acciones de contacto SOLO si está SUSPENDIDO */}
              {estadoBanner.tipo === 'Suspendido' && (
                <div style={contactRowStyle}>
                  <a href={mailHref} style={contactLinkStyle} aria-label="Contactar por correo">
                    <MailIcon />
                    <span style={{ marginLeft: 8 }}>Escribir al administrador</span>
                  </a>

                  <a href={waHref} target="_blank" rel="noopener noreferrer" style={contactLinkStyle} aria-label="Contactar por WhatsApp">
                    <WhatsIcon />
                    <span style={{ marginLeft: 8 }}>Abrir WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Link a políticas si NO está suspendido */}
              {estadoBanner.tipo !== 'Suspendido' && (
                <div className="mt-2 text-sm" style={{ marginTop: '0.5rem' }}>
                  <a
                    href={politicasPdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#AA4A44] underline"
                  >
                    Ver políticas de uso (PDF)
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(loginUser)} style={formStyle}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.3rem', color: '#3B2F2F' }}>
              Bienvenido(a) de nuevo
            </h1>

            <small style={{ color: '#3B2F2F', display: 'block', textAlign: 'center', marginBottom: '1.5rem' }}>
              Por favor ingresa tus datos
            </small>

            <input
              type="email"
              placeholder="Correo electrónico"
              {...register('email', { required: 'El correo es obligatorio' })}
              style={inputStyle}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            <div style={{ position: 'relative', marginTop: '1rem' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                style={{ ...inputStyle, paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  userSelect: 'none'
                }}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            <select
              {...register('role', { required: 'El rol es obligatorio' })}
              style={selectStyle}
            >
              <option value="">Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText}>{errors.role.message}</p>}

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot/id" style={{ color: '#AA4A44', fontSize: '0.9rem', textDecoration: 'underline' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" style={buttonStyle}>
              Iniciar sesión
            </button>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" style={{ color: '#AA4A44', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Regresar
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: '#AA4A44',
                  padding: '0.5rem 1.2rem',
                  borderRadius: '20px',
                  color: 'white',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Registrarse
              </Link>
            </div>

            {/* Si en el futuro quieres login con Google:
              <a href={GOOGLE_CLIENT_URL} style={googleButtonStyleBlue}>Login con Google (Cliente)</a>
              <a href={GOOGLE_EMPRENDEDOR_URL} style={googleButtonStyleGray}>Login con Google (Emprendedor)</a>
            */}
          </form>
        </div>
      </div>
    </div>
  );
};

// Animación burbujas
const Bubbles = () => (
  <div style={bubblesContainer}>
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        style={{
          ...bubble,
          animationDelay: `${i * 0.4}s`,
          left: `${Math.random() * 100}%`,
          width: `${10 + Math.random() * 15}px`,
          height: `${10 + Math.random() * 15}px`
        }}
      />
    ))}
  </div>
);

/** Iconos inline (SVG) */
const MailIcon = ({ size = 18, color = '#AA4A44' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.6" />
    <path d="M4 7l8 6 8-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhatsIcon = ({ size = 18, color = '#25D366' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 3C9.372 3 4 8.373 4 15a11.9 11.9 0 0 0 1.641 6l-1.1 4.02 4.108-1.077A12 12 0 1 0 16 3z" stroke={color} strokeWidth="1.6" />
    <path d="M12.2 11.8c-.3-.72-.47-.74-.88-.76-.23-.012-.49-.01-.75-.01-.26 0-.69.1-1.05.5-.36.4-1.38 1.35-1.38 3.29 0 1.94 1.41 3.81 1.61 4.07.2.26 2.73 4.17 6.75 5.68 3.34 1.29 4.02 1.04 4.75.98.73-.06 2.34-.95 2.67-1.87.33-.92.33-1.71.23-1.87-.1-.16-.36-.26-.75-.46-.39-.2-2.34-1.15-2.71-1.28-.36-.13-.62-.19-.88.19-.26.38-1 1.28-1.22 1.54-.23.26-.45.29-.84.1-.39-.2-1.63-.6-3.11-1.9-1.15-.98-1.93-2.18-2.16-2.56-.23-.38-.02-.58.17-.77.18-.18.39-.46.59-.69.2-.23.26-.38.39-.64.13-.26.06-.49-.03-.69-.09-.2-.81-2-1.13-2.72z" fill={color} />
  </svg>
);

// Estilos
const containerStyle = {
  position: 'relative',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};
const backgroundStyle = {
  position: 'absolute',
  top: 0, left: 0,
  height: '100%', width: '100%',
  backgroundImage: `url(${fondoblanco})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: 0,
  filter: 'brightness(0.85)'
};
const bubblesContainer = {
  position: 'absolute',
  top: 0, left: 0, width: '100%', height: '100%',
  zIndex: 1, pointerEvents: 'none', overflow: 'hidden'
};
const bubble = {
  position: 'absolute',
  bottom: '-50px',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  borderRadius: '50%',
  animationName: 'rise',
  animationDuration: '8s',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  opacity: 0.7
};

const cardStyle = {
  display: 'flex',
  width: '100%', maxWidth: '850px', height: '650px',
  borderRadius: '25px', overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  background: '#fff',
  position: 'relative', zIndex: 2
};
const leftPanelStyle = { flex: 1, borderRadius: '5%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const formContainerStyle = { flex: 1, background: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const formStyle = { maxWidth: '380px', width: '100%', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', color: '#3B2F2F', fontWeight: '500' };
const selectStyle = { width: '100%', padding: '0.5rem', marginTop: '1rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#fff', color: '#3B2F2F', fontWeight: '500' };
const buttonStyle = { width: '100%', padding: '0.5rem', marginTop: '1.5rem', backgroundColor: '#AA4A44', color: 'white', border: 'none', borderRadius: '25px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' };
const errorText = { color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' };
const googleButtonStyleGray = {
  backgroundColor: 'white', border: '1px solid #ccc',
  padding: '0.5rem 1rem', borderRadius: '20px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#444', fontWeight: '600', textDecoration: 'none',
  fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', userSelect: 'none'
};
const googleButtonStyleBlue = { ...googleButtonStyleGray, borderColor: '#1976d2', color: 'white', backgroundColor: '#1976d2' };

/** Estilos para la fila de contacto dentro del banner */
const contactRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginTop: '0.25rem'
};
const contactLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '9999px',
  padding: '0.4rem 0.9rem',
  backgroundColor: '#ffffff',
  color: '#3B2F2F',
  fontWeight: 600,
  border: '1px solid rgba(0,0,0,0.1)',
  textDecoration: 'none',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
};

export default Login;
