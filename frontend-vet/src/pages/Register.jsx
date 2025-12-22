// src/components/Register.jsx
import { useState, useEffect } from "react";
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
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const POLICIES_VERSION = '2025-12-22';

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

  // ====== CSS responsivo inyectado (para clases jp-*) ======
  useEffect(() => {
    // Crea un <style> si no hay stylesheet disponible
    let sheet = document.styleSheets && document.styleSheets[0];
    if (!sheet) {
      const styleEl = document.createElement('style');
      styleEl.type = 'text/css';
      document.head.appendChild(styleEl);
      sheet = styleEl.sheet;
    }

    const rules = [
      // Ocultar panel de imagen y ajustar espacios en pantallas pequeñas
      `@media (max-width: 768px) {
        .jp-left-panel { display: none !important; }
        .jp-card { width: 95vw !important; height: auto !important; max-height: none !important; border-radius: 20px !important; }
        .jp-form { padding: 1rem !important; }
        .jp-title { position: sticky; top: 0; background: #fff; padding: .5rem 0; z-index: 3; border-bottom: 1px solid #eee; }
      }`,
      // Evitar que los errores “empujen” el layout en exceso
      `.jp-error { word-wrap: break-word; white-space: normal; line-height: 1.2; }`,
      // Asegurar que inputs ocupen ancho completo
      `.jp-input, .jp-select { box-sizing: border-box; width: 100%; }`
    ];

    // Inserta reglas si no existen
    if (sheet) {
      const existing = Array.from(sheet.cssRules || []).map(r => r.cssText);
      rules.forEach(rule => {
        if (!existing.includes(rule)) {
          sheet.insertRule(rule, sheet.cssRules.length);
        }
      });
    }
  }, []);

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />
      <Bubbles />

      <div style={cardStyle} className="jp-card">
        {/* Panel de imagen (se oculta en móviles) */}
        <div style={leftPanelStyle} className="jp-left-panel" />

        {/* Formulario */}
        <div style={formContainerStyle} className="jp-form">
          <form onSubmit={handleSubmit(registro)} style={formStyle}>
            <h1 style={formTitle} className="jp-title">Bienvenido(a)</h1>
            <p style={formSubtitle}>Por favor ingresa tus datos</p>

            <input
              className="jp-input"
              placeholder="Nombre"
              {...register("nombre", {
                required: "El nombre es obligatorio",
                minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
              })}
              style={inputStyle}
            />
            {errors.nombre && <p style={errorText} className="jp-error">{errors.nombre.message}</p>}

            <input
              className="jp-input"
              placeholder="Apellido"
              {...register("apellido", {
                required: "El apellido es obligatorio",
                minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" }
              })}
              style={inputStyle}
            />
            {errors.apellido && <p style={errorText} className="jp-error">{errors.apellido.message}</p>}

            <input
              className="jp-input"
              placeholder="Celular"
              type="text"
              {...register("celular", {
                required: "El celular es obligatorio",
                pattern: { value: /^[0-9]{10}$/, message: "El celular debe tener exactamente 10 dígitos" }
              })}
              style={inputStyle}
            />
            {errors.celular && <p style={errorText} className="jp-error">{errors.celular.message}</p>}

            <input
              className="jp-input"
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
            {errors.email && <p style={errorText} className="jp-error">{errors.email.message}</p>}

            <input
              className="jp-input"
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginTop: '0.3rem', fontSize: '0.85rem', background: 'none', border: 'none', color: '#AA4A44', cursor: 'pointer' }}
            >
              {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            </button>
            {errors.password && <p style={errorText} className="jp-error">{errors.password.message}</p>}

            <select
              className="jp-select"
              {...register("role", { required: "El rol es obligatorio" })}
              style={selectStyle}
            >
              <option value="">Selecciona un rol</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText} className="jp-error">{errors.role.message}</p>}

            {/* Aceptación de Términos + Política */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '1rem' }}>
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
            {errors.accepted && <p style={errorText} className="jp-error">{errors.accepted.message}</p>}

            {/* Botón de registro */}
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

/* ===================== Estilos ===================== */
const containerStyle = {
  position: 'relative',
  minHeight: '100vh',
  width: '100vw',
  overflow: 'auto',            // ✅ permite scroll si los errores crecen
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',        // ✅ margen interior en móviles
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

const styleSheet = document.styleSheets && document.styleSheets[0];
const keyframes =
`@keyframes rise {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
}`;
if (styleSheet) {
  const rules = Array.from(styleSheet.cssRules || []).map(r => r.cssText);
  if (!rules.includes(keyframes)) {
    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
  }
} else {
  // Fallback si no existe styleSheet
  const styleEl = document.createElement('style');
  styleEl.type = 'text/css';
  styleEl.appendChild(document.createTextNode(keyframes));
  document.head.appendChild(styleEl);
}

const cardStyle = {
  display: 'flex',
  width: '100%',
  maxWidth: '950px',           // ✅ se adapta a viewport
  minHeight: '560px',
  height: 'auto',              // ✅ evita romper layout
  maxHeight: '90vh',           // ✅ evita desbordes
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
  overflowY: 'auto',           // ✅ scrollea este panel si hay muchos errores
  maxHeight: '90vh',
};

const formStyle = {
  maxWidth: '420px',
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
  marginBottom: '1.2rem',
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
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: '#fff',
};

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
  lineHeight: 1.2,
};

export default Register;
