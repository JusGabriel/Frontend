// src/components/Register.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import panecillo from "../pages/Imagenes/panecillo.jpg";
import fondo from "../assets/fondoblanco.jpg";
import politicasPdf from "../assets/Politicas_QuitoEmprende.pdf"; // ✅ PDF

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const POLICIES_VERSION = '2025-12-22';

  // Responsivo sin CSS inyectado: detecta ancho y actualiza layout
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
        telefono: data.celular,
        termsAccepted: true,
        privacyAccepted: true,
        policiesVersionAccepted: POLICIES_VERSION,
      };

      const respuesta = await axios.post(url, payload);
      toast.success(respuesta.data.msg);
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Error al registrar");
    }
  };

  const accepted = watch('accepted', false);

  // ===== Estilos calculados (responsivo estable) =====
  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    overflow: 'hidden',          // ✅ evita scroll de toda la página
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '1rem' : '2rem',
  };

  const backgroundStyle = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${fondo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.85)',
    zIndex: 0,
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'clamp(820px, 92vw, 1020px)',
    height: isMobile ? 'auto' : '88vh',    // ✅ máximo dentro del viewport
    maxHeight: '88vh',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.20)',
    background: '#fff',
    zIndex: 2,
  };

  const leftPanelStyle = {
    display: isMobile ? 'none' : 'block',
    flex: 1,
    backgroundImage: `url(${panecillo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRight: isMobile ? 'none' : '8px solid white',
  };

  const formContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    // ✅ sticky header visible siempre, scroll solo aquí
    height: isMobile ? 'auto' : '88vh',
    maxHeight: isMobile ? 'none' : '88vh',
    overflowY: 'auto',
    background: '#fff',
    padding: isMobile ? '1rem' : '1.5rem',
  };

  const formStyle = {
    width: '100%',
    margin: '0 auto',
    maxWidth: isMobile ? '480px' : '480px',
  };

  const headerBar = {
    position: 'sticky', // ✅ se queda arriba al hacer scroll interno
    top: 0,
    background: '#fff',
    zIndex: 3,
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #eee',
    marginBottom: '1rem',
  };

  const formTitle = {
    fontSize: isMobile ? '1.6rem' : '1.8rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: '0.25rem',
    fontFamily: "'Playfair Display', serif",
    color: '#3B2F2F',
  };

  const formSubtitle = {
    textAlign: 'center',
    margin: 0,
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
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  };

  const selectStyle = { ...inputStyle };

  const buttonStyle = {
    width: '100%',
    padding: '0.7rem',
    marginTop: '1.2rem',
    backgroundColor: '#AA4A44',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
  };

  const errorText = {
    color: 'red',
    fontSize: '0.85rem',
    marginTop: '0.3rem',
    lineHeight: 1.25,
    wordBreak: 'break-word',
  };

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />

      <div style={cardStyle}>
        {/* Panel imagen (oculto en móviles) */}
        <div style={leftPanelStyle} />

        {/* Panel formulario (scroll interno, header sticky) */}
        <div style={formContainerStyle}>
          <div style={headerBar}>
            <h1 style={formTitle}>Bienvenido(a)</h1>
            <p style={formSubtitle}>Por favor ingresa tus datos</p>
          </div>

          <form onSubmit={handleSubmit(registro)} style={formStyle}>
            {/* Nombre */}
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <input
                placeholder="Nombre"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                  pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
                })}
                style={inputStyle}
              />
              {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}
            </label>

            {/* Apellido */}
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <input
                placeholder="Apellido"
                {...register("apellido", {
                  required: "El apellido es obligatorio",
                  minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
                  pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
                })}
                style={inputStyle}
              />
              {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}
            </label>

            {/* Celular */}
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <input
                placeholder="Celular"
                type="text"
                {...register("celular", {
                  required: "El celular es obligatorio",
                  pattern: { value: /^[0-9]{10}$/, message: "El celular debe tener exactamente 10 dígitos" }
                })}
                style={inputStyle}
              />
              {errors.celular && <p style={errorText}>{errors.celular.message}</p>}
            </label>

            {/* Email */}
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <input
                placeholder="Correo electrónico"
                type="email"
                {...register("email", {
                  required: "El correo electrónico es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "El correo electrónico no es válido"
                  }
                })}
                style={inputStyle}
              />
              {errors.email && <p style={errorText}>{errors.email.message}</p>}
            </label>

            {/* Password */}
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                    message: "La contraseña debe contener letras y números"
                  }
                })}
                style={inputStyle}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                marginTop: '0.2rem',
                marginBottom: '0.4rem',
                fontSize: '0.85rem',
                background: 'none',
                border: 'none',
                color: '#AA4A44',
                cursor: 'pointer',
                padding: 0
              }}
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            {/* Rol */}
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              <select
                {...register("role", { required: "El rol es obligatorio" })}
                style={selectStyle}
              >
                <option value="">Selecciona un rol</option>
                <option value="editor">Emprendedor</option>
                <option value="user">Cliente</option>
              </select>
              {errors.role && <p style={errorText}>{errors.role.message}</p>}
            </label>

            {/* Aceptación de Términos + Política */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                {...register('accepted', { required: "Debes aceptar los Términos y la Política de Privacidad para continuar" })}
                style={{ marginTop: '0.2rem' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#333' }}>
                He leído y acepto los{' '}
                <a
                  href={politicasPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#AA4A44', textDecoration: 'none' }}
                  aria-label="Abrir políticas de QuitoEmprende en PDF"
                >
                  Términos y la Política de Privacidad de QuitoEmprende
                </a>.
              </span>
            </label>
            {errors.accepted && <p style={errorText}>{errors.accepted.message}</p>}

            {/* Botón registro (deshabilitado si no se acepta) */}
            <button
              type="submit"
              disabled={!accepted}
              style={{
                ...buttonStyle,
                opacity: accepted ? 1 : 0.6,
                cursor: accepted ? 'pointer' : 'not-allowed'
              }}
            >
              Registrarse
            </button>

            {/* Login existente */}
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
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

export default Register;
