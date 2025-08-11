import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Lottie from 'lottie-react';
import storeAuth from '../context/storeAuth';

import Dog_loginn from "../assets/animaciones/Dog_loginn.json";
import fondoblanco from '../assets/fondoblanco.jpg';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { token, setToken, setRol, setId } = storeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get('token');
    const rolFromUrl = query.get('rol');
    const idFromUrl = query.get('id');

    if (tokenFromUrl && rolFromUrl && idFromUrl) {
      setToken(tokenFromUrl);
      setRol(rolFromUrl);
      setId(idFromUrl);
      navigate('/dashboard');
    }
  }, [location.search, setToken, setRol, setId, navigate]);

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
        case 'user':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/clientes/login`;
          break;
        case 'editor':
          endpoint = `${import.meta.env.VITE_BACKEND_URL}/api/emprendedores/login`;
          break;
        default:
          toast.error('Selecciona un rol válido');
          return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const contentType = response.headers.get('content-type');
      let result;
      if (contentType?.includes('application/json')) {
        result = await response.json();
      } else {
        throw new Error('No existen estos datos para el rol seleccionado');
      }

      if (!response.ok) throw new Error(result.msg || 'Credenciales incorrectas');

      setToken(result.token);
      setRol(result.rol || data.role);
      setId(result._id);

      toast.success('Inicio de sesión exitoso');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado');
    }
  };

  const GOOGLE_CLIENT_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/cliente';
  const GOOGLE_EMPRENDEDOR_URL = 'https://backend-production-bd1d.up.railway.app/auth/google/emprendedor';

  return (
    <div style={containerStyle}>
      <ToastContainer />

      {/* Fondo con imagen */}
      <div style={backgroundStyle} />

      {/* Animación de burbujas con CSS */}
      <Bubbles />

      {/* Layout / Card por encima */}
      <div style={cardStyle}>

        {/* Panel izquierdo con animación */}
        <div style={leftPanelStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: "#3B2F2F" }}>Quito Emprende</h2>
            <div style={{ width: '180px', height: '180px', marginBottom: '1rem' }}>
              <Lottie animationData={Dog_loginn} loop={true} />
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: "#3B2F2F" }}>Jimbaquingo - SBetancourt - CTambaco</p>
          </div>
        </div>

        {/* Formulario login */}
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

            <div style={{ marginTop: '1.5rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <hr style={{ flex: 1, borderColor: '#ccc' }} />
              <span style={{ color: '#888', fontSize: '0.9rem' }}>O</span>
              <hr style={{ flex: 1, borderColor: '#ccc' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={GOOGLE_CLIENT_URL}
                style={googleButtonStyleGray}
                aria-label="Ingresar con Google como Cliente"
              >
                <img
                  className="w-5 mr-2"
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google"
                  style={{ width: '20px', marginRight: '8px' }}
                />
                Ingresar con Google como Cliente
              </a>
              <a
                href={GOOGLE_EMPRENDEDOR_URL}
                style={googleButtonStyleBlue}
                aria-label="Ingresar con Google como Emprendedor"
              >
                <img
                  className="w-5 mr-2"
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google"
                  style={{ width: '20px', marginRight: '8px' }}
                />
                Ingresar con Google como Emprendedor
              </a>
            </div>

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

          </form>
        </div>
      </div>
    </div>
  );
};

const Bubbles = () => {
  return (
    <div style={bubblesContainer}>
      {[...Array(15)].map((_, i) => (
        <div key={i} style={{ ...bubble, animationDelay: `${i * 0.4}s`, left: `${Math.random() * 100}%`, width: `${10 + Math.random() * 15}px`, height: `${10 + Math.random() * 15}px` }} />
      ))}
    </div>
  );
};

const containerStyle = {
  position: 'relative',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const backgroundStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  backgroundImage: `url(${fondoblanco})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: 0,
  filter: 'brightness(0.85)',
};

const bubblesContainer = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  pointerEvents: 'none',
  overflow: 'hidden',
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
  opacity: 0.7,
};

// Animación keyframes en CSS-in-JS
const styleSheet = document.styleSheets[0];
const keyframes =
`@keyframes rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110vh) scale(1.3);
    opacity: 0;
  }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

// (Después puedes copiar los estilos originales que tienes para el resto del componente)

const cardStyle = {
  display: 'flex',
  width: '100%',
  maxWidth: '850px',
  height: '650px',
  borderRadius: '25px',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  background: '#fff',
  position: 'relative',
  zIndex: 2,
};

const leftPanelStyle = {
  flex: 1,
  borderRadius: '5%',
  backgroundColor: '#F7E5D2',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  border: '8px solid white',
};

const formContainerStyle = {
  flex: 1,
  background: '#ffffff',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const formStyle = {
  maxWidth: '380px',
  width: '100%',
  margin: '0 auto',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '0.5rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '1rem',
  color: '#3B2F2F',
  fontWeight: '500',
};

const selectStyle = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '1rem',
  backgroundColor: '#fff',
  color: '#3B2F2F',
  fontWeight: '500',
};

const buttonStyle = {
  width: '100%',
  padding: '0.5rem',
  marginTop: '1.5rem',
  backgroundColor: '#AA4A44',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '600',
};

const errorText = {
  color: 'red',
  fontSize: '0.8rem',
  marginTop: '0.25rem',
};

const googleButtonStyleGray = {
  backgroundColor: 'white',
  border: '1px solid #ccc',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#444',
  fontWeight: '600',
  textDecoration: 'none',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  userSelect: 'none',
};

const googleButtonStyleBlue = {
  ...googleButtonStyleGray,
  borderColor: '#1976d2',
  color: 'white',
  backgroundColor: '#1976d2',
};

export default Login;
