import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import fondo from "../assets/fondoblanco.jpg";
import panecillo from "../pages/Imagenes/panecillo.jpg";

const Register = () => {
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
        telefono: data.celular,
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
        {/* Imagen lateral */}
        <div style={leftPanelStyle}>
          <img
            src={panecillo}
            alt="Panecillo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "5%",
              border: "8px solid white",
            }}
          />
        </div>

        {/* Formulario */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit(registro)} style={formStyle}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "600", textAlign: "center", marginBottom: "0.3rem", color: "#3B2F2F" }}>
              Bienvenido(a)
            </h1>
            <small style={{ color: "#3B2F2F", display: "block", textAlign: "center", marginBottom: "1.5rem" }}>
              Por favor ingresa tus datos
            </small>

            <input
              placeholder="Nombre"
              {...register("nombre", { required: "El nombre es obligatorio" })}
              style={inputStyle}
            />
            {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}

            <input
              placeholder="Apellido"
              {...register("apellido", { required: "El apellido es obligatorio" })}
              style={inputStyle}
            />
            {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}

            <input
              type="number"
              placeholder="Celular"
              {...register("celular", { required: "El celular es obligatorio" })}
              style={inputStyle}
            />
            {errors.celular && <p style={errorText}>{errors.celular.message}</p>}

            <input
              type="email"
              placeholder="Correo electrónico"
              {...register("email", { required: "El correo electrónico es obligatorio" })}
              style={inputStyle}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}

            <div style={{ position: "relative", marginTop: "1rem" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                {...register("password", { required: "La contraseña es obligatoria" })}
                style={{ ...inputStyle, paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  userSelect: "none",
                }}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && <p style={errorText}>{errors.password.message}</p>}

            <select {...register("role", { required: "El rol es obligatorio" })} style={selectStyle}>
              <option value="">Selecciona un rol</option>
              <option value="editor">Emprendedor</option>
              <option value="user">Cliente</option>
            </select>
            {errors.role && <p style={errorText}>{errors.role.message}</p>}

            <button type="submit" style={buttonStyle}>
              Registrarse
            </button>

            <div style={{ marginTop: "1.5rem", marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <hr style={{ flex: 1, borderColor: "#ccc" }} />
              <span style={{ color: "#888", fontSize: "0.9rem" }}>O</span>
              <hr style={{ flex: 1, borderColor: "#ccc" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={loginGoogleCliente}
                style={{ ...googleButtonStyleGray }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google"
                  style={{ width: "20px", marginRight: "8px" }}
                />
                Ingresar con Google como Cliente
              </button>
              <button
                type="button"
                onClick={loginGoogleEmprendedor}
                style={{ ...googleButtonStyleBlue }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                  alt="Google"
                  style={{ width: "20px", marginRight: "8px" }}
                />
                Ingresar con Google como Emprendedor
              </button>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link to="/login" style={{ color: "#AA4A44", fontSize: "0.9rem", textDecoration: "underline" }}>
                ¿Ya tienes una cuenta? Iniciar sesión
              </Link>
              <Link
                to="/"
                style={{
                  backgroundColor: "#AA4A44",
                  padding: "0.5rem 1.2rem",
                  borderRadius: "20px",
                  color: "white",
                  fontWeight: "600",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Volver
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

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
          height: `${10 + Math.random() * 15}px`,
        }}
      />
    ))}
  </div>
);

// Estilos (igual que en Login.jsx)
const containerStyle = { position: "relative", height: "100vh", width: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" };
const backgroundStyle = { position: "absolute", top: 0, left: 0, height: "100%", width: "100%", backgroundImage: `url(${fondo})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, filter: "brightness(0.85)" };
const bubblesContainer = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", overflow: "hidden" };
const bubble = { position: "absolute", bottom: "-50px", backgroundColor: "rgba(255, 255, 255, 0.4)", borderRadius: "50%", animationName: "rise", animationDuration: "8s", animationTimingFunction: "linear", animationIterationCount: "infinite", opacity: 0.7 };
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`@keyframes rise { 0% { transform: translateY(0) scale(1); opacity: 0.7; } 100% { transform: translateY(-110vh) scale(1.3); opacity: 0; } }`, styleSheet.cssRules.length);

const cardStyle = { display: "flex", width: "100%", maxWidth: "850px", height: "650px", borderRadius: "25px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", background: "#fff", position: "relative", zIndex: 2 };
const leftPanelStyle = { flex: 1, borderRadius: "5%", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" };
const formContainerStyle = { flex: 1, background: "#ffffff", padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" };
const formStyle = { maxWidth: "380px", width: "100%", margin: "0 auto" };
const inputStyle = { width: "100%", padding: "0.5rem", marginTop: "0.5rem", border: "1px solid #ccc", borderRadius: "8px", fontSize: "1rem", color: "#3B2F2F", fontWeight: "500" };
const selectStyle = { width: "100%", padding: "0.5rem", marginTop: "1rem", border: "1px solid #ccc", borderRadius: "8px", fontSize: "1rem", backgroundColor: "#fff", color: "#3B2F2F", fontWeight: "500" };
const buttonStyle = { width: "100%", padding: "0.5rem", marginTop: "1.5rem", backgroundColor: "#AA4A44", color: "white", border: "none", borderRadius: "25px", fontSize: "1rem", cursor: "pointer", fontWeight: "600" };
const errorText = { color: "red", fontSize: "0.8rem", marginTop: "0.25rem" };
const googleButtonStyleGray = { backgroundColor: "white", border: "1px solid #ccc", padding: "0.5rem 1rem", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontWeight: "600", textDecoration: "none", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.3s ease", userSelect: "none" };
const googleButtonStyleBlue = { ...googleButtonStyleGray, borderColor: "#1976d2", color: "white", backgroundColor: "#1976d2" };

export default Register;
