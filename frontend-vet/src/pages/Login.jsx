// src/pages/Login.jsx
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

  // Datos de contacto solicitados por el usuario
  const CONTACT_EMAIL = 'sebasj@outlook.com.ar';
  const CONTACT_PHONE_DISPLAY = '0984523160';
  // Formateo para WhatsApp: quitar el 0 inicial y añadir código de país (Ecuador: 593)
  const CONTACT_PHONE_WHATSAPP = '593984523160'; // 0984523160 -> 593 + 984523160
  const WHATSAPP_PRETEXT = encodeURIComponent('Hola, necesito asistencia con mi cuenta.');
  const MAIL_SUBJECT = encodeURIComponent('Contacto desde la plataforma');
  const MAIL_BODY = encodeURIComponent('Hola,\n\nTengo una consulta y requiero asistencia.\n\nGracias.');

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

  return (
    <div style={containerStyle}>
      <ToastContainer />

      {/* Animación */}
      <style>{`
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
        }
      `}</style>

      <div style={backgroundStyle} />
      <Bubbles />

      <div style={cardStyle}>
        {/* Imagen lateral */}
        <div style={leftPanelStyle}>
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
        <div style={formContainerStyle}>
          {/* Banner de advertencia/suspensión */}
          {estadoBanner && (
            <div
              className={`mb-4 p-3 rounded-lg text-center font-semibold text-base
                ${estadoBanner.tipo === 'Suspendido'
                  ? 'bg-red-100 border border-red-400 text-red-800'
                  : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
                }`}
              style={{ wordBreak: 'break-word' }}
            >
              {estadoBanner.msg}
              {estadoBanner.tipo !== 'Suspendido' && (
                <div className="mt-2 text-sm">
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

          {/* --- NOTIFICACIÓN DE CONTACTO (nuevo) --- */}
          <div style={notificationStyle} role="status" aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0 }}>
                <path d="M12 2a7 7 0 0 1 7 7v3l2 4H3l2-4V9a7 7 0 0 1 7-7z" fill="#AA4A44" />
              </svg>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: '#3B2F2F' }}>¿Necesitas ayuda inmediata?</span>

                {/* Enlace correo -> mailto */}
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=${MAIL_SUBJECT}&body=${MAIL_BODY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={contactLinkStyle}
                  title={`Enviar correo a ${CONTACT_EMAIL}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 6 }}>
                    <path d="M3 8.5v7A2.5 2.5 0 0 0 5.5 18h13A2.5 2.5 0 0 0 21 15.5v-7A2.5 2.5 0 0 0 18.5 6h-13A2.5 2.5 0 0 0 3 8.5z" stroke="#3B2F2F" strokeWidth="0.8" fill="none"/>
                    <path d="M21 8.5L12 13 3 8.5" stroke="#3B2F2F" strokeWidth="0.8" fill="none"/>
                  </svg>
                  {CONTACT_EMAIL}
                </a>

                {/* Enlace whatsapp -> wa.me */}
                <a
                  href={`https://wa.me/${CONTACT_PHONE_WHATSAPP}?text=${WHATSAPP_PRETEXT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={contactPhoneStyle}
                  title={`Abrir WhatsApp a ${CONTACT_PHONE_DISPLAY}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: 6 }}>
                    <path d="M20.5 3.5A11 11 0 0 0 3.5 20.5L2 22l1.6-4.6A11 11 0 1 0 20.5 3.5z" fill="#25D366"/>
                    <path d="M17.3 14.2c-.3-.1-1.8-.9-2-.9-.2 0-.4 0-.6.2-.2.3-.6.9-.7 1.1-.1.2-.3.2-.6.1-1-.5-3.2-1.9-4.7-3.9-.4-.6.4-.6 1.1-2 .1-.2 0-.4 0-.6 0-.2-.5-.6-1-.9-1.3-.7-1.9-1.8-2.1-2.1-.1-.2 0-.5.1-.7.2-.3.6-.6 1-.6h.8c.3 0 .6 0 .9.1.3.1.6.2 1 .3.5.2 1 .5 1.4.7.4.2.6.4.9.6.3.2.8.7 1.1 1 .3.4.5.9.7 1.1.2.3.4.6.5.8.1.2.2.4.2.6.1.3 0 .6-.1.8-.1.2-.4.4-.8.6z" fill="#fff"/>
                  </svg>
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </div>
          {/* --- FIN NOTIFICACIÓN --- */}

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

// --- estilos para la notificación de contacto ---
const notificationStyle = {
  background: '#fff7f6',
  border: '1px solid #F3D4D2',
  padding: '10px 14px',
  borderRadius: 10,
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 2px 10px rgba(170,74,68,0.06)',
  fontSize: 13,
  color: '#3B2F2F'
};
const contactLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  textDecoration: 'none',
  color: '#AA4A44',
  background: 'transparent',
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid rgba(170,74,68,0.08)'
};
const contactPhoneStyle = {
  ...contactLinkStyle,
  background: '#eaf9ee',
  color: '#1f6b3e',
  border: '1px solid rgba(31,107,62,0.08)'
};

export default Login;
