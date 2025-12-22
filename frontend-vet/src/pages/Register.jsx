// src/components/Register.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import panecillo from "../pages/Imagenes/panecillo.jpg";
import fondo from "../assets/fondoblanco.jpg";
import politicasPdf from "../assets/Politicas_QuitoEmprende.pdf"; // ✅ PDF

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : true
  );
  const [step, setStep] = useState(0); // ✅ Wizard sin scroll
  const POLICIES_VERSION = "2025-12-22";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm({ mode: "onChange" });

  // Responsivo estable con matchMedia (sin layout shift)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Envío
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

  const accepted = watch("accepted", false);

  // Campos por paso para validar antes de avanzar
  const stepFields = [
    ["nombre", "apellido", "celular"], // Paso 0
    ["email", "password"], // Paso 1
    ["role", "accepted"], // Paso 2
  ];

  const goNext = async () => {
    const ok = await trigger(stepFields[step]);
    if (ok) setStep((s) => Math.min(s + 1, 2));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // ===== Estilos sin scroll =====
  const containerStyle = {
    position: "relative",
    height: "100dvh", // ✅ usa dvh para móviles modernos
    width: "100vw",
    overflow: "hidden", // ✅ sin scroll global
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isMobile ? "0.75rem" : "1.5rem",
    boxSizing: "border-box",
  };

  const backgroundStyle = {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${fondo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "brightness(0.88)",
    zIndex: 0,
  };

  const cardStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    width: isMobile ? "100%" : "clamp(860px, 92vw, 1080px)",
    height: isMobile ? "100dvh" : "min(88dvh, 760px)", // ✅ cabe en viewport
    maxHeight: isMobile ? "100dvh" : "88dvh",
    borderRadius: isMobile ? "0.75rem" : "1.25rem",
    overflow: "hidden", // ✅ evita que algo se salga
    boxShadow: "0 10px 40px rgba(0,0,0,0.20)",
    background: "#fff",
    zIndex: 2,
    boxSizing: "border-box",
  };

  const leftPanelStyle = {
    display: isMobile ? "none" : "block",
    flex: "1 1 45%",
    backgroundImage: `url(${panecillo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRight: isMobile ? "none" : "8px solid white",
  };

  const formContainerStyle = {
    flex: "1 1 55%",
    display: "flex",
    flexDirection: "column",
    height: "100%", // ✅ sin scroll interno
    overflow: "hidden",
    background: "#fff",
    padding: isMobile ? "1rem" : "1.5rem",
    boxSizing: "border-box",
    gap: isMobile ? "0.75rem" : "1rem",
  };

  const headerBar = {
    flex: "0 0 auto",
    background: "#fff",
    zIndex: 3,
    paddingBottom: "0.5rem",
    borderBottom: "1px solid #eee",
  };

  const formTitle = {
    fontSize: isMobile ? "clamp(1.2rem, 3.5vw, 1.6rem)" : "clamp(1.4rem, 2.3vw, 1.8rem)",
    fontWeight: 600,
    textAlign: "center",
    marginBottom: "0.25rem",
    fontFamily: "'Playfair Display', serif",
    color: "#3B2F2F",
    lineHeight: 1.15,
  };

  const formSubtitle = {
    textAlign: "center",
    margin: 0,
    fontSize: isMobile ? "0.9rem" : "1rem",
    color: "#555",
    lineHeight: 1.2,
  };

  const stepContainerStyle = {
    flex: "1 1 auto",          // ✅ ocupa el espacio central
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",  // ✅ centrado vertical
    gap: isMobile ? "0.6rem" : "0.8rem",
    overflow: "hidden",        // ✅ sin scroll
    boxSizing: "border-box",
  };

  const inputsGroupStyle = {
    width: "100%",
    margin: "0 auto",
    maxWidth: isMobile ? "480px" : "520px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: isMobile ? "0.6rem" : "0.75rem",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  };

  const selectStyle = { ...inputStyle };

  const errorText = {
    color: "red",
    fontSize: "0.85rem",
    marginTop: "0.25rem",
    lineHeight: 1.25,
    wordBreak: "break-word",
  };

  const footerNavStyle = {
    flex: "0 0 auto",
    display: "flex",
    gap: "0.6rem",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
    paddingTop: "0.75rem",
  };

  const primaryBtn = {
    padding: "0.7rem 1rem",
    backgroundColor: "#AA4A44",
    color: "white",
    border: "none",
    borderRadius: "999px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
  };

  const secondaryBtn = {
    padding: "0.7rem 1rem",
    backgroundColor: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "999px",
    fontSize: "1rem",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
  };

  // Paso actual: render condicional
  const StepContent = () => {
    if (step === 0) {
      return (
        <div style={inputsGroupStyle}>
          {/* Nombre */}
          <label>
            <input
              placeholder="Nombre"
              {...register("nombre", {
                required: "El nombre es obligatorio",
                minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" },
              })}
              style={inputStyle}
            />
            {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}
          </label>

          {/* Apellido */}
          <label>
            <input
              placeholder="Apellido"
              {...register("apellido", {
                required: "El apellido es obligatorio",
                minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres" },
                pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: "Solo se permiten letras y espacios" },
              })}
              style={inputStyle}
            />
            {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}
          </label>

          {/* Celular */}
          <label>
            <input
              placeholder="Celular"
              type="text"
              {...register("celular", {
                required: "El celular es obligatorio",
                pattern: { value: /^[0-9]{10}$/, message: "El celular debe tener exactamente 10 dígitos" },
              })}
              style={inputStyle}
            />
            {errors.celular && <p style={errorText}>{errors.celular.message}</p>}
          </label>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div style={inputsGroupStyle}>
          {/* Email */}
          <label>
            <input
              placeholder="Correo electrónico"
              type="email"
              {...register("email", {
                required: "El correo electrónico es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "El correo electrónico no es válido",
                },
              })}
              style={inputStyle}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}
          </label>

          {/* Password + toggle */}
          <label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                  message: "La contraseña debe contener letras y números",
                },
              })}
              style={inputStyle}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              alignSelf: "flex-start",
              fontSize: "0.85rem",
              background: "none",
              border: "none",
              color: "#AA4A44",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
          {errors.password && <p style={errorText}>{errors.password.message}</p>}
        </div>
      );
    }

    // step === 2
    return (
      <div style={inputsGroupStyle}>
        {/* Rol */}
        <label>
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
        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
          <input
            type="checkbox"
            {...register("accepted", {
              required: "Debes aceptar los Términos y la Política de Privacidad para continuar",
            })}
            style={{ marginTop: "0.2rem" }}
          />
          <span style={{ fontSize: "0.9rem", color: "#333" }}>
            He leído y acepto los{" "}
            <a
              href={politicasPdf}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#AA4A44", textDecoration: "none" }}
              aria-label="Abrir políticas de QuitoEmprende en PDF"
            >
              Términos y la Política de Privacidad de QuitoEmprende
            </a>
            .
          </span>
        </label>
        {errors.accepted && <p style={errorText}>{errors.accepted.message}</p>}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <ToastContainer />
      <div style={backgroundStyle} />

      <div style={cardStyle}>
        {/* Panel imagen (oculto en móviles) */}
        <div style={leftPanelStyle} />

        {/* Panel formulario sin scroll */}
        <div style={formContainerStyle}>
          {/* Header */}
          <div style={headerBar}>
            <h1 style={formTitle}>Bienvenido(a)</h1>
            <p style={formSubtitle}>Por favor ingresa tus datos</p>
          </div>

          {/* Contenido del paso (centrado, sin scroll) */}
          <div style={stepContainerStyle}>
            <StepContent />
          </div>

          {/* Footer navegación + envío */}
          <div style={footerNavStyle}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                style={{
                  ...secondaryBtn,
                  opacity: step === 0 ? 0.6 : 1,
                  cursor: step === 0 ? "not-allowed" : "pointer",
                }}
              >
                Atrás
              </button>

              {step < 2 && (
                <button type="button" onClick={goNext} style={primaryBtn}>
                  Siguiente
                </button>
              )}
            </div>

            {step === 2 && (
              <form
                onSubmit={handleSubmit(registro)}
                style={{ display: "inline" }}
              >
                <button
                  type="submit"
                  disabled={!accepted}
                  style={{
                    ...primaryBtn,
                    opacity: accepted ? 1 : 0.6,
                    cursor: accepted ? "pointer" : "not-allowed",
                  }}
                >
                  Registrarse
                </button>
              </form>
            )}
          </div>

          {/* Login existente */}
          <p
            style={{
              textAlign: "center",
              marginTop: isMobile ? "0.4rem" : "0.6rem",
              fontSize: "0.9rem",
            }}
          >
            ¿Ya posees una cuenta?{" "}
            <Link to="/login" style={{ color: "#AA4A44", textDecoration: "underline" }}>
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
