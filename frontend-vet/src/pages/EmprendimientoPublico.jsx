import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function EmprendimientoPublico() {
  const { nombreComercial } = useParams();
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://backend-production-bd1d.up.railway.app/api/emprendimientos/publico/${nombreComercial}`
        );
        const data = await res.json();
        setEmprendimiento(data);
      } catch (error) {
        console.error("Error cargando emprendimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [nombreComercial]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Cargando emprendimiento...</h2>
      </div>
    );

  if (!emprendimiento || emprendimiento.message === "No encontrado")
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Emprendimiento no encontrado</h2>
        <p>No existe un emprendimiento llamado: {nombreComercial}</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src={emprendimiento.logo}
          alt={emprendimiento.nombreComercial}
          style={styles.logo}
        />

        <h1 style={styles.title}>{emprendimiento.nombreComercial}</h1>

        <p style={styles.descripcion}>{emprendimiento.descripcion}</p>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>Ubicación</h2>
          <p><strong>Dirección:</strong> {emprendimiento.ubicacion?.direccion}</p>
          <p><strong>Ciudad:</strong> {emprendimiento.ubicacion?.ciudad}</p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.subtitle}>Contacto</h2>
          <p><strong>Teléfono:</strong> {emprendimiento.contacto?.telefono}</p>
          <p><strong>Email:</strong> {emprendimiento.contacto?.email}</p>

          {emprendimiento.contacto?.sitioWeb && (
            <p>
              <strong>Sitio Web:</strong>{" "}
              <a href={emprendimiento.contacto.sitioWeb} target="_blank">
                {emprendimiento.contacto.sitioWeb}
              </a>
            </p>
          )}

          {emprendimiento.contacto?.facebook && (
            <p>
              <strong>Facebook:</strong>{" "}
              <a href={emprendimiento.contacto.facebook} target="_blank">
                {emprendimiento.contacto.facebook}
              </a>
            </p>
          )}

          {emprendimiento.contacto?.instagram && (
            <p>
              <strong>Instagram:</strong>{" "}
              <a href={emprendimiento.contacto.instagram} target="_blank">
                {emprendimiento.contacto.instagram}
              </a>
            </p>
          )}
        </div>

        <p style={styles.estado}>
          <strong>Estado:</strong> {emprendimiento.estado}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px",
    background: "#F4F6F9",
    minHeight: "100vh",
  },
  card: {
    maxWidth: "650px",
    width: "100%",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  logo: {
    width: "150px",
    height: "150px",
    objectFit: "cover",
    borderRadius: "100%",
    display: "block",
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginTop: "20px",
  },
  descripcion: {
    textAlign: "center",
    fontSize: "18px",
    marginTop: "10px",
    marginBottom: "25px",
  },
  section: {
    marginBottom: "25px",
  },
  subtitle: {
    fontSize: "20px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "5px",
    marginBottom: "10px",
  },
  estado: {
    marginTop: "20px",
    fontSize: "18px",
    textAlign: "center",
  },
};
