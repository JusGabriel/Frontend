
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

export default Login;
``

