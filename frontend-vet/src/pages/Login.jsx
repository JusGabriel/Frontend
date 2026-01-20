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
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('No existen estos datos para el rol seleccionado');
      }

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && (result?.estadoUI === 'Suspendido' || result?.status === false)) {
          clearToken();
          setEstadoBanner({
            tipo: 'Suspendido',
            msg: estadoMensajesBase['Suspendido']
          });
          toast.error(result?.msg || estadoMensajesBase['Suspendido']);
          return;
        }
        throw new Error(result?.msg || 'Credenciales incorrectas');
      }

      setToken(result.token);
      setRol(result.rol);
      setId(result._id);

      toast.success('Inicio de sesión exitoso');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error inesperado');
    }
  };

  return (
    <div style={containerStyle}>
      <ToastContainer />

      <div style={backgroundStyle} />

      <div style={cardStyle}>
        <div style={leftPanelStyle}>
          <img src={panecillo} alt="Panecillo" style={imageStyle} />
        </div>

        <div style={formContainerStyle}>

          {/* 🔔 Barra de contacto */}
          <div style={contactBar}>
            <a href="mailto:sebasj@outlook.com" style={contactLink}>
              📧 Contactar por correo
            </a>
            <a
              href="https://wa.me/593984523160"
              target="_blank"
              rel="noopener noreferrer"
              style={contactLink}
            >
              📱 WhatsApp soporte
            </a>
          </div>

          {estadoBanner && (
            <div style={bannerStyle}>
              {estadoBanner.msg}
            </div>
          )}

          <form onSubmit={handleSubmit(loginUser)} style={formStyle}>
            <h1 style={titleStyle}>Bienvenido(a) de nuevo</h1>
            <small style={subtitleStyle}>Por favor ingresa tus datos</small>

            <input
              type="email"
              placeholder="Correo electrónico"
              {...register('email', { required: 'El correo es obligatorio' })}
              style={inputStyle}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                {...register('password', { required: 'La contraseña es obligatoria' })}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={showButton}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <select {...register('role', { required: true })} style={selectStyle}>
              <option value="">Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>

            <button type="submit" style={buttonStyle}>Iniciar sesión</button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ================= ESTILOS ================= */

const containerStyle = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const backgroundStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `url(${fondoblanco})`,
  backgroundSize: 'cover',
  filter: 'brightness(0.85)'
};

const cardStyle = {
  display: 'flex',
  maxWidth: '850px',
  width: '100%',
  height: '650px',
  borderRadius: '25px',
  overflow: 'hidden',
  background: '#fff',
  zIndex: 2
};

const leftPanelStyle = { flex: 1 };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };

const formContainerStyle = {
  flex: 1,
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const contactBar = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '1rem',
  fontSize: '0.85rem'
};

const contactLink = {
  color: '#AA4A44',
  textDecoration: 'underline',
  fontWeight: '600'
};

const formStyle = { maxWidth: '380px', margin: '0 auto' };
const titleStyle = { textAlign: 'center', fontSize: '1.8rem' };
const subtitleStyle = { textAlign: 'center', marginBottom: '1rem' };
const inputStyle = { width: '100%', padding: '0.6rem', marginTop: '0.5rem' };
const selectStyle = { width: '100%', padding: '0.6rem', marginTop: '1rem' };
const buttonStyle = { width: '100%', marginTop: '1.5rem', padding: '0.6rem', background: '#AA4A44', color: '#fff', border: 'none', borderRadius: '25px' };
const showButton = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' };
const errorText = { color: 'red', fontSize: '0.8rem' };
const bannerStyle = { background: '#fdecea', padding: '0.8rem', borderRadius: '10px', marginBottom: '1rem' };

export default Login;
