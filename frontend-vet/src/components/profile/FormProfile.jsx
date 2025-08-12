import { useState, useEffect } from "react";
import storeProfile from "../../context/storeProfile";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormularioPerfil = () => {
  const { user, updateProfile } = storeProfile();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        nombre: user?.nombre,
        apellido: user?.apellido,
        telefono: user?.telefono,
        email: user?.email,
      });
    }
  }, [user, reset]);

  const updateUser = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Actualizando perfil...", { autoClose: false });
    try {
      const response = await updateProfile(data, user._id);

      toast.update(toastId, {
        render: response.success
          ? "Perfil actualizado correctamente"
          : response.error || "Error al actualizar el perfil",
        type: response.success ? "success" : "error",
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true,
        draggable: true,
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Ocurrió un error inesperado",
        type: "error",
        isLoading: false,
        autoClose: 2000,
        closeOnClick: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div style={cardContainer}>
        <h2 style={titleStyle}>Editar Perfil</h2>
        <hr style={dividerStyle} />

        <form onSubmit={handleSubmit(updateUser)} style={formStyle}>
          <h3 style={sectionTitle}>Datos personales</h3>

          <div style={inputGroup}>
            <input
              type="text"
              placeholder="Nombre"
              style={inputStyle}
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && <p style={errorText}>{errors.nombre.message}</p>}
          </div>

          <div style={inputGroup}>
            <input
              type="text"
              placeholder="Apellido"
              style={inputStyle}
              {...register("apellido", { required: "El apellido es obligatorio" })}
            />
            {errors.apellido && <p style={errorText}>{errors.apellido.message}</p>}
          </div>

          <h3 style={sectionTitle}>Contacto</h3>

          <div style={inputGroup}>
            <input
              type="number"
              placeholder="Teléfono"
              style={inputStyle}
              {...register("telefono", { required: "El teléfono es obligatorio" })}
            />
            {errors.telefono && <p style={errorText}>{errors.telefono.message}</p>}
          </div>

          <div style={inputGroup}>
            <input
              type="email"
              placeholder="Correo electrónico"
              style={inputStyle}
              {...register("email", { required: "El correo es obligatorio" })}
            />
            {errors.email && <p style={errorText}>{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...submitButton,
              backgroundColor: isLoading ? "#ccc" : "#AA4A44",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#8C3E39")}
            onMouseOut={(e) => !isLoading && (e.currentTarget.style.backgroundColor = "#AA4A44")}
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </form>
      </div>
    </>
  );
};

// --- Estilos ---
const cardContainer = {
  background: "#ffffff",
  padding: "1.5rem",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  width: "100%",
  maxWidth: "750px",
  margin: "0 auto",
};

const titleStyle = {
  fontSize: "1.6rem",
  fontWeight: "600",
  color: "#3B2F2F",
  marginBottom: "1rem",
  textAlign: "center",
  fontFamily: "'Playfair Display', serif",
};

const dividerStyle = {
  border: "none",
  borderTop: "2px solid #ccc",
  marginBottom: "1rem",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
};

const sectionTitle = {
  fontSize: "1rem",
  fontWeight: "600",
  color: "#3B2F2F",
  marginTop: "1rem",
  marginBottom: "0.5rem",
  fontFamily: "'Playfair Display', serif",
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "10px",
  fontSize: "1rem",
  color: "#333",
};

const errorText = {
  color: "red",
  fontSize: "0.8rem",
  marginTop: "0.3rem",
};

const submitButton = {
  padding: "0.5rem",
  backgroundColor: "#AA4A44",
  color: "white",
  border: "none",
  borderRadius: "25px",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "1rem",
};

export default FormularioPerfil;
