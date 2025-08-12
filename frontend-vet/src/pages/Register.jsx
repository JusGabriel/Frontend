import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import panecillo from "../pages/Imagenes/panecillo.jpg";
import fondo from "../assets/fondoblanco.jpg";

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const GOOGLE_CLIENT_URL = "https://backend-production-bd1d.up.railway.app/auth/google/cliente";
  const GOOGLE_EMPRENDEDOR_URL = "https://backend-production-bd1d.up.railway.app/auth/google/emprendedor";

  const registro = async (data) => {
    try {
      let url = "";
      if (data.role === "editor") {
        url = "https://backend-production-bd1d.up.railway.app/api/emprendedores/registro";
      } else if (data.role === "user") {
        url = "https://backend-production-bd1d.up.railway.app/api/clientes/registro";
      } else {
        toast.error("Selecciona un rol válido");
        return;
      }

      const payload = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password,
        telefono: data.celular
      };

      const respuesta = await axios.post(url, payload);
      toast.success(respuesta.data.msg);
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Error al registrar");
    }
  };

  const loginGoogleCliente = () => {
    window.location.href = GOOGLE_CLIENT_URL;
  };

  const loginGoogleEmprendedor = () => {
    window.location.href = GOOGLE_EMPRENDEDOR_URL;
  };

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />
      <Bubbles />
      <div style={cardStyle}>
        {/* Imagen panecillo */}
        <div style={leftPanelStyle}></div>

        {/* Formulario */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit(registro)} style={formStyle}>
            <h1 style={formTitle}>Bienvenido(a)</h1>
            <p style={formSubtitle}>Por favor ingresa tus datos</p>

            <input placeholder="Nombre" {...register("nombre", { required: "El nombre es obligatorio" })} style={inputStyle} />
            {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}

            <input placeholder="Apellido" {...register("apellido", { required: "El apellido es obligatorio" })} style={inputStyle} />
            {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}

            <input placeholder="Celular" type="number" {...register("celular", { required: "El celular es obligatorio" })} style={inputStyle} />
            {errors.celular && <p style={errorText}>{errors.celular.message}</p>}

            <input placeholder="Correo electrónico" type="email" {...register("email", { required: "El correo electrónico es obligatorio" })} style={inputStyle} />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password", { required: "La contraseña es obligatoria" })}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginTop: '0.3rem', fontSize: '0.85rem', background: 'none', border: 'none', color: '#AA4A44', cursor: 'pointer' }}
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            <select {...register("role", { required: "El rol es obligatorio" })} style={selectStyle}>
              <option value="">Selecciona un rol</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText}>{errors.role.message}</p>}

            <button type="submit" style={buttonStyle}>Registrarse</button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" onClick={loginGoogleCliente} style={{ ...googleButtonStyle, backgroundColor: '#EA4335' }}>
                Google Cliente
              </button>
              <button type="button" onClick={loginGoogleEmprendedor} style={{ ...googleButtonStyle, backgroundColor: '#4285F4' }}>
                Google Emprendedor
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              ¿Ya posees una cuenta?{' '}
              <Link to="/login" style={{ color: '#AA4A44', textDecoration: 'underline' }}>
                Iniciar sesión
              </Link>
            </p>
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
};

const containerStyle = {
  position: 'relative',
  height: '100vh',
  width: '100vw',
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
  backgroundImage: `url(${fondo})`,
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
if (styleSheet) {
  const rules = Array.from(styleSheet.cssRules).map(r => r.cssText);
  if (!rules.includes(keyframes)) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
}

const cardStyle = {
  display: 'flex',
  width: '850px',
  height: '600px',
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
  borderRadius: '25px 0 0 25px',
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

const formTitle = {
  fontSize: '1.8rem',
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: '0.1rem',
  fontFamily: "'Playfair Display', serif",
  color: '#3B2F2F',
};

const formSubtitle = {
  textAlign: 'center',
  marginBottom: '1.5rem',
  fontSize: '0.95rem',
  color: '#555',
};

const inputStyle = {
  width: '100%',
  padding: '0.6rem',
  marginTop: '0.4rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '1rem',
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: '#fff',
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
  fontFamily: "'Segoe UI', sans-serif",
};

const googleButtonStyle = {
  flex: 1,
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  padding: '0.4rem',
  margin: '0 0.3rem',
  cursor: 'pointer',
};

const errorText = {
  color: 'red',
  fontSize: '0.85rem',
  marginTop: '0.3rem',
};

export default Register;
