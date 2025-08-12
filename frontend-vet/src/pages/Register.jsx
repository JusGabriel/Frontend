import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import panecillo from "../pages/imagenes/panecillo.jpg";

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
      {/* Panel Izquierdo con imagen */}
      <div style={leftPanelStyle}>
        {/* Ya no hay animación ni texto */}
      </div>

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
  );
};

const containerStyle = {
  display: 'flex',
  width: '100%',
  height: '750px',
  maxWidth: '850px',
  borderRadius: '25px',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  background: '#fff',
  margin: 'auto',
  position: 'relative',
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
