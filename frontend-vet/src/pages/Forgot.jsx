import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

import fondoblanco from '../assets/fondoblanco.jpg';
import panecillo from '../pages/Imagenes/panecillo.jpg';

export const Forgot = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const { email, role } = data;

    let endpoint = '';
    switch (role) {
      case 'admin':
        endpoint = 'https://backend-production-bd1d.up.railway.app/api/administradores/recuperarpassword';
        break;
      case 'editor':
        endpoint = 'https://backend-production-bd1d.up.railway.app/api/emprendedores/recuperarpassword';
        break;
      case 'user':
        endpoint = 'https://backend-production-bd1d.up.railway.app/api/clientes/recuperar-password';
        break;
      default:
        toast.error("Selecciona un rol válido");
        return;
    }

    try {
      await axios.post(endpoint, { email });
      toast.success("Correo de recuperación enviado");
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={containerStyle}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Animación CSS de burbujas */}
      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) scale(1.3);
            opacity: 0;
          }
        }
      `}</style>

      {/* Fondo general */}
      <div style={backgroundStyle} />

      {/* Burbujas */}
      <div style={bubblesContainer}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              ...bubbleStyle,
              animationDelay: `${i * 0.4}s`,
              left: `${Math.random() * 100}%`,
              width: `${10 + Math.random() * 15}px`,
              height: `${10 + Math.random() * 15}px`
            }}
          />
        ))}
      </div>

      {/* Tarjeta central */}
      <div style={cardStyle}>
        {/* Panel izquierdo con imagen */}
        <div style={leftPanelStyle} />

        {/* Formulario */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit(onSubmit)} style={formStyle}>
            <h1 style={titleStyle}>¡Olvidaste tu contraseña!</h1>
            <small style={subtitleStyle}>
              No te preocupes. Ingresa tu correo y selecciona tu rol para recibir un correo de recuperación.
            </small>

            {/* Email */}
            <input
              type="email"
              placeholder="Ingresa un correo electrónico válido"
              {...register("email", { required: "El correo es obligatorio" })}
              style={{
                ...inputStyle,
                borderColor: errors.email ? '#e53e3e' : '#ccc'
              }}
            />
            {errors.email && (
              <p style={errorStyle}>{errors.email.message}</p>
            )}

            {/* Rol */}
            <select
              {...register("role", { required: "El rol es obligatorio" })}
              defaultValue=""
              style={{
                ...selectStyle,
                borderColor: errors.role ? '#e53e3e' : '#ccc'
              }}
            >
              <option value="" disabled>Selecciona un rol</option>
              <option value="admin">Administrador</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && (
              <p style={errorStyle}>{errors.role.message}</p>
            )}

            <button type="submit" style={buttonStyle}>
              Enviar correo
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
              ¿Ya posees una cuenta?{' '}
              <Link to="/login" style={{ color: '#AA4A44', textDecoration: 'underline' }}>
                Iniciar sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* --- ESTILOS --- */
const containerStyle = {
  position: 'relative',
  height: '100vh',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Georgia', serif",
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
  overflow: 'hidden'
};

const bubbleStyle = {
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
  backgroundImage: `url(${panecillo})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
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

const titleStyle = {
  fontSize: '1.8rem',
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: '1rem',
  fontFamily: "'Playfair Display', serif",
  color: '#3B2F2F',
};

const subtitleStyle = {
  textAlign: 'center',
  display: 'block',
  marginBottom: '1.5rem',
  fontSize: '0.9rem',
  color: '#555',
};

const inputStyle = {
  width: '100%',
  padding: '1rem',
  marginTop: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '1rem',
};

const selectStyle = {
  width: '100%',
  padding: '1rem',
  marginTop: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '1rem',
  backgroundColor: '#fff',
};

const buttonStyle = {
  width: '100%',
  padding: '1rem',
  marginTop: '1.5rem',
  backgroundColor: '#AA4A44',
  color: 'white',
  border: 'none',
  borderRadius: '25px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontFamily: "'Segoe UI', sans-serif",
};

const errorStyle = {
  color: '#e53e3e',
  fontSize: '0.8rem',
  marginTop: '0.25rem',
};
