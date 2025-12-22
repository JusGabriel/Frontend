import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import panecillo from "../pages/Imagenes/panecillo.jpg";
import fondo from "../assets/fondoblanco.jpg";
import politicasPdf from "../assets/Politicas_QuitoEmprende.pdf";

/** Hook simple para manejar breakpoints responsivos */
function useViewport() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return {
    width,
    isMobile: width < 640,              // <sm
    isTablet: width >= 640 && width < 1024, // sm..md/lg
    isDesktop: width >= 1024
  };
}

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPoliticas, setShowPoliticas] = useState(false);

  // Validación en tiempo real para habilitar/deshabilitar el botón
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm({ mode: "onChange" });

  const aceptoTerminos = watch("terminos", false);
  const roleValue = watch("role", "");

  const { isMobile, isTablet, isDesktop } = useViewport();

  /** ENDPOINTS de registro */
  const EMPRENDEDOR_REG_URL = "https://backend-production-bd1d.up.railway.app/api/emprendedores/registro";
  const CLIENTE_REG_URL     = "https://backend-production-bd1d.up.railway.app/api/clientes/registro";

  const registro = async (data) => {
    try {
      // 1) Validación explícita de términos
      if (!data.terminos) {
        toast.error("Debes aceptar los términos y políticas.");
        return;
      }

      // 2) Validación de rol
      let url = "";
      if (data.role === "editor") {
        url = EMPRENDEDOR_REG_URL;
      } else if (data.role === "user") {
        url = CLIENTE_REG_URL;
      } else {
        toast.error("Selecciona un rol válido");
        return;
      }

      // 3) Payload
      const payload = {
        nombre:   data.nombre,
        apellido: data.apellido,
        email:    data.email,
        password: data.password,
        telefono: data.celular
      };

      // 4) POST
      const respuesta = await axios.post(url, payload);
      toast.success(respuesta?.data?.msg || "Registro exitoso");
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Error al registrar");
    }
  };

  /** ====== Estilos Responsivos ====== */
  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    overflowX: 'hidden',
    overflowY: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '1rem' : '2rem'
  };

  const backgroundStyle = {
    position: 'absolute',
    top: 0, left: 0,
    height: '100%',
    width: '100%',
    backgroundImage: `url(${fondo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
    filter: 'brightness(0.85)'
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '92vw' : isTablet ? '90vw' : '850px',
    maxWidth: '1000px',
    minHeight: isMobile ? 'auto' : '680px',
    borderRadius: '25px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    background: '#fff',
    position: 'relative',
    zIndex: 2
  };

  const leftPanelStyle = {
    flex: 1,
    backgroundImage: `url(${panecillo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: isMobile ? '25px 25px 0 0' : '25px 0 0 25px',
    border: '8px solid white',
    height: isMobile ? '200px' : 'auto'
  };

  const formContainerStyle = {
    flex: 1,
    background: '#ffffff',
    padding: isMobile ? '1rem' : '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const formStyle = {
    maxWidth: isMobile ? '100%' : isTablet ? '440px' : '420px',
    width: '100%',
    margin: '0 auto'
  };

  const formTitle = {
    fontSize: isMobile ? '1.6rem' : '1.8rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '0.1rem',
    fontFamily: "'Playfair Display', serif",
    color: '#3B2F2F'
  };

  const formSubtitle = {
    textAlign: 'center',
    marginBottom: '1.2rem',
    fontSize: isMobile ? '0.9rem' : '0.95rem',
    color: '#555'
  };

  const inputStyle = {
    width: '100%',
    padding: isMobile ? '0.55rem' : '0.6rem',
    marginTop: '0.4rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '1rem'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: '#fff'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.55rem',
    marginTop: '1.2rem',
    backgroundColor: '#AA4A44',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
    transition: 'background-color 0.2s ease'
  };

  const errorText = {
    color: 'red',
    fontSize: '0.85rem',
    marginTop: '0.3rem'
  };

  /** ====== Animación Burbujas ====== */
  const bubblesContainer = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none',
    overflow: 'hidden'
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

  // Inserta keyframes de la animación (idempotente)
  useEffect(() => {
    const keyframes = `
      @keyframes rise {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
      }
    `;
    const styleId = 'rise-keyframes-style';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.type = 'text/css';
      styleEl.appendChild(document.createTextNode(keyframes));
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />
      <Bubbles bubblesContainer={bubblesContainer} bubble={bubble} />

      <div style={cardStyle}>
        {/* Panel imagen (izquierda / top en móvil) */}
        <div style={leftPanelStyle} />

        {/* Formulario */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit(registro)} style={formStyle}>
            <h1 style={formTitle}>Bienvenido(a)</h1>
            <p style={formSubtitle}>Por favor ingresa tus datos</p>

            {/* Nombre */}
            <input
              placeholder="Nombre"
              {...register("nombre", {
                required: "El nombre es obligatorio",
                minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
              })}
              style={inputStyle}
              aria-label="Nombre"
            />
            {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}

            {/* Apellido */}
            <input
              placeholder="Apellido"
              {...register("apellido", {
                required: "El apellido es obligatorio",
                minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
              })}
              style={inputStyle}
              aria-label="Apellido"
            />
            {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}

            {/* Celular */}
            <input
              placeholder="Celular"
              type="text"
              {...register("celular", {
                required: "El celular es obligatorio",
                pattern: { value: /^[0-9]{10}$/, message: "El celular debe tener exactamente 10 dígitos" }
              })}
              style={inputStyle}
              aria-label="Celular"
            />
            {errors.celular && <p style={errorText}>{errors.celular.message}</p>}

            {/* Email */}
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
              aria-label="Correo electrónico"
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            {/* Password */}
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
              aria-label="Contraseña"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                marginTop: '0.3rem',
                fontSize: '0.85rem',
                background: 'none',
                border: 'none',
                color: '#AA4A44',
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            {/* Rol */}
            <select
              {...register("role", { required: "El rol es obligatorio" })}
              style={selectStyle}
              aria-label="Selecciona un rol"
              defaultValue=""
            >
              <option value="">Selecciona un rol</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText}>{errors.role.message}</p>}

            {/* Términos y políticas */}
            <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <input
                type="checkbox"
                id="terminos"
                {...register("terminos", { required: "Debes aceptar los términos y políticas" })}
                aria-checked={aceptoTerminos}
                aria-label="Aceptar términos y políticas"
              />
              <label htmlFor="terminos" style={{ fontSize: '0.92rem', color: '#333', lineHeight: 1.4 }}>
                Acepto los{" "}
                <button
                  type="button"
                  onClick={() => setShowPoliticas(true)}
                  style={{ color: '#AA4A44', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Ver políticas de QuitoEmprende (PDF)"
                  title="Ver políticas (PDF)"
                >
                  términos y políticas
                </button>{" "}
                de QuitoEmprende.
              </label>
            </div>
            {errors.terminos && <p style={errorText}>{errors.terminos.message}</p>}

            {/* Botón de registro (deshabilitado hasta cumplir validaciones y aceptar términos) */}
            <button
              type="submit"
              style={{
                ...buttonStyle,
                ...( !isValid || !aceptoTerminos
                  ? { backgroundColor: '#cfcfcf', cursor: 'not-allowed', color: '#666' }
                  : {} )
              }}
              disabled={!isValid || !aceptoTerminos}
              aria-disabled={!isValid || !aceptoTerminos}
              title={!isValid || !aceptoTerminos ? "Completa los campos y acepta los términos para registrarte" : "Registrarse"}
            >
              Registrarse
            </button>

            {/* Enlace a login */}
            <p style={{ textAlign: 'center', marginTop: '1.3rem', fontSize: '0.9rem' }}>
              ¿Ya posees una cuenta?{" "}
              <Link to="/login" style={{ color: '#AA4A44', textDecoration: 'underline' }}>
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Modal de Políticas (PDF) */}
      {showPoliticas && (
        <div
          className="politicas-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="politicas-modal-title"
          onClick={() => setShowPoliticas(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowPoliticas(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: isMobile ? '0.8rem' : '1rem',
              width: isMobile ? '95vw' : '90vw',
              maxWidth: '1000px',
              height: isMobile ? '80vh' : '80vh',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPoliticas(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '1.3rem',
                color: '#666',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>

            <h2 id="politicas-modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#AA4A44', marginBottom: '0.6rem' }}>
              Políticas de QuitoEmprende (PDF)
            </h2>

            <object
              data={politicasPdf}
              type="application/pdf"
              aria-label="Visor de PDF de políticas"
              style={{
                width: '100%',
                height: '100%',
                border: '1px solid #E0C7B6',
                borderRadius: '8px'
              }}
            >
              <p style={{ padding: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                Tu navegador no puede mostrar el PDF embebido.
                <a
                  href={politicasPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#AA4A44', textDecoration: 'underline', marginLeft: '0.3rem' }}
                >
                  Ábrelo en una pestaña nueva
                </a>.
              </p>
            </object>

            <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a
                href={politicasPdf}
                download="Politicas_QuitoEmprende.pdf"
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: '#AA4A44',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}
              >
                Descargar PDF
              </a>
              <a
                href={politicasPdf}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.4rem 0.8rem',
                  border: '1px solid #AA4A44',
                  color: '#AA4A44',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}
              >
                Abrir en pestaña nueva
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** ====== Burbujas decorativas ====== */
const Bubbles = ({ bubblesContainer, bubble }) => {
  return (
    <div style={bubblesContainer} aria-hidden>
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

export default Register;
