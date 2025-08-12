import React, { useEffect, useState } from "react";
import storeAuth from "../../context/storeAuth";

const BASE_URLS = {
  cliente: "https://backend-production-bd1d.up.railway.app/api/clientes",
  emprendedor: "https://backend-production-bd1d.up.railway.app/api/emprendedores",
};

const emptyForm = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  telefono: "",
};

const Table = () => {
  const [tipo, setTipo] = useState("cliente");
  const [lista, setLista] = useState([]);
  const [formCrear, setFormCrear] = useState(emptyForm);
  const [formEditar, setFormEditar] = useState({ id: null, ...emptyForm });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expandido, setExpandido] = useState(null);

  const setChatUser = storeAuth((state) => state.setChatUser);

  const fetchLista = async () => {
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/todos`);
      const data = await res.json();
      setLista(data);
    } catch {
      setError("Error cargando datos");
    }
  };

  useEffect(() => {
    fetchLista();
    setFormCrear(emptyForm);
    setFormEditar({ id: null, ...emptyForm });
    setExpandido(null);
    setError("");
    setMensaje("");
  }, [tipo]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCrear),
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "Error al crear");
      else {
        setMensaje(`${tipo === "cliente" ? "Cliente" : "Emprendedor"} creado`);
        setFormCrear(emptyForm);
        fetchLista();
      }
    } catch {
      setError("Error al crear");
    }
  };

  const prepararEditar = (item) => {
    setFormEditar({
      id: item._id,
      nombre: item.nombre || "",
      apellido: item.apellido || "",
      email: item.email || "",
      password: "",
      telefono: item.telefono || "",
    });
    setMensaje("");
    setError("");
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    const { id, nombre, apellido, email, password, telefono } = formEditar;
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, password, telefono }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "Error al actualizar");
      else {
        setMensaje(`${tipo === "cliente" ? "Cliente" : "Emprendedor"} actualizado`);
        setFormEditar({ id: null, ...emptyForm });
        fetchLista();
      }
    } catch {
      setError("Error al actualizar");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm(`¿Eliminar este ${tipo}?`)) return;
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${BASE_URLS[tipo]}/eliminar/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) setError(data.msg || "Error al eliminar");
      else {
        setMensaje(`${tipo === "cliente" ? "Cliente" : "Emprendedor"} eliminado`);
        fetchLista();
      }
    } catch {
      setError("Error al eliminar");
    }
  };

  const toggleExpandido = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  const inputsForm = (form, setForm) => (
    <>
      <input
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        required
      />
      <input
        style={styles.input}
        placeholder="Apellido"
        value={form.apellido}
        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        required
      />
      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required={form.id === null}
      />
      <input
        style={styles.input}
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
      />
    </>
  );

  // Función para capitalizar la primera letra
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: "center" }}>
        Gestión {tipo === "cliente" ? "Clientes" : "Emprendedores"}
      </h1>

      <div style={styles.toggleContainer}>
        <button
          style={tipo === "cliente" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("cliente")}
        >
          Clientes
        </button>
        <button
          style={tipo === "emprendedor" ? styles.toggleActive : styles.toggle}
          onClick={() => setTipo("emprendedor")}
        >
          Emprendedores
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {mensaje && <p style={{ color: "green", textAlign: "center" }}>{mensaje}</p>}

      {/* Form Crear */}
      <form onSubmit={handleCrear} style={styles.form}>
        <h2>Crear {capitalize(tipo)}</h2>
        {inputsForm(formCrear, setFormCrear)}
        <button style={styles.btnCrear} type="submit">
          Crear
        </button>
      </form>

      {/* Form Editar */}
      {formEditar.id && (
        <form onSubmit={handleActualizar} style={styles.form}>
          <h2>Editar {capitalize(tipo)}</h2>
          {inputsForm(formEditar, setFormEditar)}
          <button style={styles.btnActualizar} type="submit">
            Actualizar
          </button>
          <button
            style={styles.btnCancelar}
            type="button"
            onClick={() => setFormEditar({ id: null, ...emptyForm })}
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Tabla */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Apellido</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Teléfono</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                No hay {capitalize(tipo)}s
              </td>
            </tr>
          )}
          {lista.map((item, i) => (
            <React.Fragment key={item._id}>
              <tr
                style={{
                  backgroundColor: expandido === item._id ? "#f0f8ff" : "white",
                  cursor: "pointer",
                }}
                onClick={() => toggleExpandido(item._id)}
              >
                <td style={styles.td}>{i + 1}</td>
                <td style={styles.td}>{item.nombre}</td>
                <td style={styles.td}>{item.apellido}</td>
                <td style={styles.td}>{item.email}</td>
                <td style={styles.td}>{item.telefono || "N/A"}</td>
                <td style={styles.td}>
                  <button
                    style={styles.btnSmall}
                    onClick={(e) => {
                      e.stopPropagation();
                      prepararEditar(item);
                    }}
                  >
                    Editar
                  </button>{" "}
                  <button
                    style={styles.btnSmallDelete}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminar(item._id);
                    }}
                  >
                    Eliminar
                  </button>{" "}
                  <button
                    style={{ ...styles.btnSmall, backgroundColor: "#28a745" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatUser({ id: item._id, rol: capitalize(tipo) });
                      alert(`Chatear con ${item.nombre} (${capitalize(tipo)})`);
                    }}
                  >
                    Chatear
                  </button>
                </td>
              </tr>
              {expandido === item._id && (
                <tr style={{ backgroundColor: "#eef6ff" }}>
                  <td colSpan="6" style={{ padding: 10 }}>
                    <strong>Detalles:</strong>
                    <div>
                      Nombre completo: {item.nombre} {item.apellido}
                    </div>
                    <div>Email: {item.email}</div>
                    <div>Teléfono: {item.telefono || "N/A"}</div>
                    <div>Creado: {new Date(item.createdAt).toLocaleString()}</div>
                    <div>Actualizado: {new Date(item.updatedAt).toLocaleString()}</div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  toggleContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
  },
  toggle: {
    backgroundColor: "#ddd",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "0 5px",
    borderRadius: 5,
    transition: "background-color 0.3s",
  },
  toggleActive: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    margin: "0 5px",
    borderRadius: 5,
    transition: "background-color 0.3s",
  },
  form: {
    marginBottom: 30,
    padding: 15,
    border: "1px solid #ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  btnCrear: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnActualizar: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: 10,
  },
  btnCancelar: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    borderBottom: "2px solid #007bff",
    padding: 10,
    textAlign: "left",
    backgroundColor: "#e9f0ff",
  },
  td: {
    borderBottom: "1px solid #ddd",
    padding: 10,
  },
  btnSmall: {
    padding: "5px 10px",
    marginRight: 5,
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
  },
  btnSmallDelete: {
    padding: "5px 10px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 3,
    cursor: "pointer",
  },
};

export default Table;
