
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import storeAuth from '../context/storeAuth';

import fondoblanco from '../assets/fondoblanco.jpg';
import panecillo from '../pages/Imagenes/panecillo.jpg';

/** Derivación segura en caso de que el backend no mande estadoUI */
function deriveEstadoUIFront(status, estado_Emprendedor) {
  if (status === false) return 'Suspendido';
  const e = estado_Emprendedor || 'Activo';
  return ['Advertencia1', 'Advertencia2', 'Advertencia3', 'Suspendido'].includes(e) ? e : 'Correcto';
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  // 👇 AÑADE setters de estado desde el store
  const {
    token, setToken, setRol, setId,
    setEstadoUI, setEstadoInterno, setStatus,
    clearToken
  } = storeAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Capturar datos desde Google OAuth (si vienen por URL)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const rolFromUrl   = query.get('rol');
    const idFromUrl    = query.get('id');

    if (tokenFromUrl && rolFromUrl && idFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      setId(idFromUrl);

      // ⚠️ Nota: en OAuth no recibimos estadoUI/estado_Emprendedor por query.
      // Si lo agregas en el futuro, acá podrás setearlos igual:
      // const estadoUIFromUrl = query.get('estadoUI');
      // const estadoInternoFromUrl = query.get('estado_Emprendedor');
      // const statusFromUrl = query.get('status');
      // setEstadoUI(estadoUIFromUrl ?? null);
      // setEstadoInterno(estadoInternoFromUrl ?? null);
      // setStatus(typeof statusFromUrl === 'string' ? statusFromUrl === 'true' : true);

      navigate('/dashboard');
    }
  }, [location.search, setToken, setRol, setId, navigate]);

  // Redirigir si ya hay token (sesión previa)
  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  const loginUser = async (data) => {
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
      // 👇 Útil para verificar nombres exactos de campos que envía el backend:
      // console.log('LOGIN response:', result);

      // 🚫 Manejo de suspensión (403)
      if (!response.ok) {
        if (response.status === 403 && (result?.estadoUI === 'Suspendido' || result?.status === false)) {
          clearToken(); // Limpia store persistido
          toast.error(result?.msg || 'Cuenta suspendida. Contacta soporte.');
          return;
        }
        throw new Error(result?.msg || 'Credenciales incorrectas');
      }

      // ✅ Persistir credenciales base
      const roleMap = { admin: 'Administrador', editor: 'Emprendedor', user: 'Cliente' };
      setToken(result.token);
      setRol(roleMap[data.role] || result.rol);
      setId(result._id);

      // ✅ Persistir estado (usa lo que venga; si no viene, deriva en frontend)
      const estadoUIResp       = result?.estadoUI ?? deriveEstadoUIFront(result?.status, result?.estado_Emprendedor);
      const estadoInternoResp  = result?.estado_Emprendedor ?? 'Activo';
      const statusResp         = typeof result?.status === 'boolean' ? result.status : true;

      setEstadoUI(estadoUIResp);
      setEstadoInterno(estadoInternoResp);
      setStatus(statusResp);

      // ℹ️ Aviso no bloqueante si tiene advertencias
      if (['Advertencia1', 'Advertencia2', 'Advertencia3'].includes(estadoUIResp)) {
        toast.warn(`Tu cuenta tiene ${estadoUIResp}. Algunas acciones podrían estar limitadas.`);
      } else {
        toast.success('Inicio de sesión exitoso');
      }

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

      {/* Animación burbujas */}
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
const containerStyle = { position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const backgroundStyle = { position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', backgroundImage: `url(${fondoblanco})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, filter: 'brightness(0.85)' };
const bubblesContainer = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none', overflow: 'hidden' };
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

const cardStyle = { display: 'flex', width: '100%', maxWidth: '850px', height: '650px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', background: '#fff', position: 'relative', zIndex: 2 };
const leftPanelStyle = { flex: 1, borderRadius: '5%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const formContainerStyle = { flex: 1, background: '#ffffff', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const formStyle = { maxWidth: '380px', width: '100%', margin: '0 auto' };
const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', color: '#3B2F2F', fontWeight: '500' };
const selectStyle = { width: '100%', padding: '0.5rem', marginTop: '1rem', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#fff', color: '#3B2F2F', fontWeight: '500' };
const buttonStyle = { width: '100%', padding: '0.5rem', marginTop: '1.5rem', backgroundColor: '#AA4A44', color: 'white', border: 'none', borderRadius: '25px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' };
const errorText = { color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' };
const googleButtonStyleGray = { backgroundColor: 'white', border: '1px solid #ccc', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', userSelect: 'none' };
const googleButtonStyleBlue = { ...googleButtonStyleGray, borderColor: '#1976d2', color: 'white', backgroundColor: '#1976d2' };

export default Login;

