import React, { useEffect, useState } from "react";

const API_BASE = "https://backend-production-bd1d.up.railway.app/api/clientes";

const Table = () => {
  const [clientes, setClientes] = useState([]);
  const [formCrear, setFormCrear] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: ""
  });
  const [formEditar, setFormEditar] = useState({
    id: null,
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: ""
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Listar clientes
  const fetchClientes = async () => {
    try {
      const res = await fetch(`${API_BASE}/todos`);
      const data = await res.json();
      setClientes(data);
    } catch (e) {
      setError("Error al cargar clientes");
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Crear cliente
  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${API_BASE}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCrear)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error al crear cliente");
      } else {
        setMensaje(data.msg || "Cliente creado");
        setFormCrear({ nombre: "", apellido: "", email: "", password: "", telefono: "" });
        fetchClientes();
      }
    } catch {
      setError("Error al crear cliente");
    }
  };

  // Preparar edición
  const prepararEditar = (cliente) => {
    setFormEditar({
      id: cliente._id,
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      email: cliente.email || "",
      password: "",
      telefono: cliente.telefono || ""
    });
    setMensaje("");
    setError("");
  };

  // Actualizar cliente
  const handleActualizar = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    const { id, nombre, apellido, email, password, telefono } = formEditar;
    try {
      const res = await fetch(`${API_BASE}/actualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, password, telefono })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error al actualizar cliente");
      } else {
        setMensaje("Cliente actualizado");
        setFormEditar({ id: null, nombre: "", apellido: "", email: "", password: "", telefono: "" });
        fetchClientes();
      }
    } catch {
      setError("Error al actualizar cliente");
    }
  };

  // Eliminar cliente
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cliente?")) return;
    setError("");
    setMensaje("");
    try {
      const res = await fetch(`${API_BASE}/eliminar/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Error al eliminar cliente");
      } else {
        setMensaje("Cliente eliminado");
        fetchClientes();
      }
    } catch {
      setError("Error al eliminar cliente");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1>Gestión Clientes</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

      {/* Form Crear */}
      <form onSubmit={handleCrear} style={{ marginBottom: 20, border: "1px solid #ccc", padding: 10 }}>
        <h2>Crear Cliente</h2>
        <input
          placeholder="Nombre"
          value={formCrear.nombre}
          onChange={e => setFormCrear({ ...formCrear, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Apellido"
          value={formCrear.apellido}
          onChange={e => setFormCrear({ ...formCrear, apellido: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formCrear.email}
          onChange={e => setFormCrear({ ...formCrear, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formCrear.password}
          onChange={e => setFormCrear({ ...formCrear, password: e.target.value })}
          required
        />
        <input
          placeholder="Teléfono"
          value={formCrear.telefono}
          onChange={e => setFormCrear({ ...formCrear, telefono: e.target.value })}
        />
        <button type="submit">Crear</button>
      </form>

      {/* Form Actualizar */}
      {formEditar.id && (
        <form onSubmit={handleActualizar} style={{ marginBottom: 20, border: "1px solid #ccc", padding: 10 }}>
          <h2>Editar Cliente</h2>
          <input
            placeholder="Nombre"
            value={formEditar.nombre}
            onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Apellido"
            value={formEditar.apellido}
            onChange={e => setFormEditar({ ...formEditar, apellido: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formEditar.email}
            onChange={e => setFormEditar({ ...formEditar, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (opcional)"
            value={formEditar.password}
            onChange={e => setFormEditar({ ...formEditar, password: e.target.value })}
          />
          <input
            placeholder="Teléfono"
            value={formEditar.telefono}
            onChange={e => setFormEditar({ ...formEditar, telefono: e.target.value })}
          />
          <button type="submit">Actualizar</button>
          <button type="button" onClick={() => setFormEditar({ id: null, nombre: "", apellido: "", email: "", password: "", telefono: "" })}>
            Cancelar
          </button>
        </form>
      )}

      {/* Tabla clientes */}
      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No hay clientes
              </td>
            </tr>
          )}
          {clientes.map((cliente, i) => (
            <tr key={cliente._id}>
              <td>{i + 1}</td>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefono || "N/A"}</td>
              <td>
                <button onClick={() => prepararEditar(cliente)}>Editar</button>{" "}
                <button onClick={() => handleEliminar(cliente._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
