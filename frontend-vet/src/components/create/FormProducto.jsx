import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";

export const FormProducto = () => {
  const { token, id: emprendedorId } = storeAuth();
  const [productos, setProductos] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmprendimientos, setLoadingEmprendimientos] = useState(false);
  const [error, setError] = useState(null);

  // Productos - formulario
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    stock: "",
  });
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false);
  const [productoEditId, setProductoEditId] = useState(null);

  // Emprendimientos - formulario
  const [formEmprendimiento, setFormEmprendimiento] = useState({
    nombreComercial: "",
    descripcion: "",
    logo: "",
    ubicacion: { direccion: "", ciudad: "", lat: "", lng: "" },
    contacto: { telefono: "", email: "", sitioWeb: "", facebook: "", instagram: "" },
    categorias: [],
    estado: "Activo",
  });
  const [modoEdicionEmp, setModoEdicionEmp] = useState(false);
  const [emprendimientoEditId, setEmprendimientoEditId] = useState(null);

  // --- Cargar Productos ---
  const cargarProductos = async () => {
    if (!emprendedorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://backend-production-bd1d.up.railway.app/api/productos/emprendedor/${emprendedorId}`
      );
      setProductos(res.data);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  // --- Cargar Emprendimientos ---
  const cargarEmprendimientos = async () => {
    setLoadingEmprendimientos(true);
    setError(null);
    try {
      const res = await axios.get(
        `https://backend-production-bd1d.up.railway.app/api/emprendimientos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmprendimientos(res.data);
    } catch {
      setError("Error al cargar emprendimientos");
    } finally {
      setLoadingEmprendimientos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarEmprendimientos();
  }, [emprendedorId]);

  // --- Manejo inputs productos ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Manejo inputs emprendimientos ---
  const handleChangeEmprendimiento = (e) => {
    const { name, value } = e.target;
    if (["direccion", "ciudad", "lat", "lng"].includes(name)) {
      setFormEmprendimiento((prev) => ({
        ...prev,
        ubicacion: { ...prev.ubicacion, [name]: value },
      }));
    } else if (["telefono", "email", "sitioWeb", "facebook", "instagram"].includes(name)) {
      setFormEmprendimiento((prev) => ({
        ...prev,
        contacto: { ...prev.contacto, [name]: value },
      }));
    } else {
      setFormEmprendimiento((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Reset formularios ---
  const resetFormProducto = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: "",
      stock: "",
    });
    setModoEdicionProducto(false);
    setProductoEditId(null);
    setError(null);
  };

  const resetFormEmprendimiento = () => {
    setFormEmprendimiento({
      nombreComercial: "",
      descripcion: "",
      logo: "",
      ubicacion: { direccion: "", ciudad: "", lat: "", lng: "" },
      contacto: { telefono: "", email: "", sitioWeb: "", facebook: "", instagram: "" },
      categorias: [],
      estado: "Activo",
    });
    setModoEdicionEmp(false);
    setEmprendimientoEditId(null);
    setError(null);
  };

  // --- Crear producto ---
  const crearProducto = async () => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    try {
      await axios.post(
        "https://backend-production-bd1d.up.railway.app/api/productos",
        {
          ...form,
          categoria: null,
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetFormProducto();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear producto");
    }
  };

  // --- Editar producto ---
  const editarProducto = (producto) => {
    setModoEdicionProducto(true);
    setProductoEditId(producto._id);
    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: producto.imagen || "",
      stock: producto.stock || "",
    });
    setError(null);
  };

  // --- Actualizar producto ---
  const actualizarProducto = async () => {
    if (!token || !productoEditId) {
      setError("No autenticado o producto inválido");
      return;
    }
    try {
      await axios.put(
        `https://backend-production-bd1d.up.railway.app/api/productos/${productoEditId}`,
        {
          ...form,
          categoria: null,
          precio: Number(form.precio),
          stock: Number(form.stock),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetFormProducto();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar producto");
    }
  };

  // --- Eliminar producto ---
  const eliminarProducto = async (id) => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await axios.delete(
        `https://backend-production-bd1d.up.railway.app/api/productos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar producto");
    }
  };

  // --- Crear emprendimiento ---
  const crearEmprendimiento = async () => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    try {
      await axios.post(
        "https://backend-production-bd1d.up.railway.app/api/emprendimientos",
        {
          ...formEmprendimiento,
          ubicacion: {
            ...formEmprendimiento.ubicacion,
            lat: parseFloat(formEmprendimiento.ubicacion.lat),
            lng: parseFloat(formEmprendimiento.ubicacion.lng),
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarEmprendimientos();
      alert("Emprendimiento creado con éxito");
      resetFormEmprendimiento();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear emprendimiento");
    }
  };

  // --- Editar emprendimiento ---
  const editarEmprendimiento = (emp) => {
    setModoEdicionEmp(true);
    setEmprendimientoEditId(emp._id);
    setFormEmprendimiento({
      nombreComercial: emp.nombreComercial || "",
      descripcion: emp.descripcion || "",
      logo: emp.logo || "",
      ubicacion: {
        direccion: emp.ubicacion?.direccion || "",
        ciudad: emp.ubicacion?.ciudad || "",
        lat: emp.ubicacion?.lat || "",
        lng: emp.ubicacion?.lng || "",
      },
      contacto: {
        telefono: emp.contacto?.telefono || "",
        email: emp.contacto?.email || "",
        sitioWeb: emp.contacto?.sitioWeb || "",
        facebook: emp.contacto?.facebook || "",
        instagram: emp.contacto?.instagram || "",
      },
      categorias: emp.categorias || [],
      estado: emp.estado || "Activo",
    });
    setError(null);
  };

  // --- Actualizar emprendimiento ---
  const actualizarEmprendimiento = async () => {
    if (!token || !emprendimientoEditId) {
      setError("No autenticado o emprendimiento inválido");
      return;
    }
    try {
      await axios.put(
        `https://backend-production-bd1d.up.railway.app/api/emprendimientos/${emprendimientoEditId}`,
        {
          ...formEmprendimiento,
          ubicacion: {
            ...formEmprendimiento.ubicacion,
            lat: parseFloat(formEmprendimiento.ubicacion.lat),
            lng: parseFloat(formEmprendimiento.ubicacion.lng),
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarEmprendimientos();
      alert("Emprendimiento actualizado con éxito");
      resetFormEmprendimiento();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar emprendimiento");
    }
  };

  // --- Eliminar emprendimiento ---
  const eliminarEmprendimiento = async (id) => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este emprendimiento?")) return;

    try {
      await axios.delete(
        `https://backend-production-bd1d.up.railway.app/api/emprendimientos/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarEmprendimientos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar emprendimiento");
    }
  };

  // --- Submit formularios ---
  const handleSubmitProducto = (e) => {
    e.preventDefault();
    if (modoEdicionProducto) {
      actualizarProducto();
    } else {
      crearProducto();
    }
  };

  const handleSubmitEmprendimiento = (e) => {
    e.preventDefault();
    if (modoEdicionEmp) {
      actualizarEmprendimiento();
    } else {
      crearEmprendimiento();
    }
  };

  return (
    <>
      {/* FORMULARIO EMPRENDIMIENTO */}
      <div style={{ ...styles.formContainer, marginBottom: "2rem" }}>
        <h2 style={styles.title}>{modoEdicionEmp ? "Editar Emprendimiento" : "Crear Emprendimiento"}</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmitEmprendimiento} style={styles.form}>
          <input
            type="text"
            name="nombreComercial"
            placeholder="Nombre Comercial"
            value={formEmprendimiento.nombreComercial}
            onChange={handleChangeEmprendimiento}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={formEmprendimiento.descripcion}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="text"
            name="logo"
            placeholder="URL Logo"
            value={formEmprendimiento.logo}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección"
            value={formEmprendimiento.ubicacion.direccion}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            value={formEmprendimiento.ubicacion.ciudad}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="number"
            step="any"
            name="lat"
            placeholder="Latitud"
            value={formEmprendimiento.ubicacion.lat}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="number"
            step="any"
            name="lng"
            placeholder="Longitud"
            value={formEmprendimiento.ubicacion.lng}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formEmprendimiento.contacto.telefono}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formEmprendimiento.contacto.email}
            onChange={handleChangeEmprendimiento}
            style={styles.input}
          />
          <div style={styles.buttonRow}>
            <button type="submit" style={styles.buttonCreate}>
              {modoEdicionEmp ? "Actualizar Emprendimiento" : "Crear Emprendimiento"}
            </button>
            {modoEdicionEmp && (
              <button type="button" onClick={resetFormEmprendimiento} style={styles.buttonCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA EMPRENDIMIENTOS */}
      <div style={styles.listaContainer}>
        <h3 style={{ width: "100%", marginBottom: 12 }}>Todos los Emprendimientos</h3>
        {loadingEmprendimientos ? (
          <p>Cargando emprendimientos...</p>
        ) : emprendimientos.length === 0 ? (
          <p>No hay emprendimientos aún.</p>
        ) : (
          emprendimientos.map((emp) => (
            <div key={emp._id} style={styles.productoCard}>
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{emp.nombreComercial}</strong>
                <p style={{ minHeight: 36, color: "#555" }}>{emp.descripcion}</p>
                {emp.logo && (
                  <img src={emp.logo} alt={emp.nombreComercial} style={{ ...styles.imagen, maxHeight: 120, objectFit: "contain" }} />
                )}
                <p style={{ marginTop: 6 }}>
                  <b>Dirección:</b> {emp.ubicacion?.direccion || "-"}, <b>Ciudad:</b> {emp.ubicacion?.ciudad || "-"}
                </p>
                <p>
                  <b>Contacto:</b> {emp.contacto?.telefono || "-"} | {emp.contacto?.email || "-"}
                </p>
              </div>
              <div style={styles.buttonsCard}>
                <button style={styles.buttonEdit} onClick={() => editarEmprendimiento(emp)}>Editar</button>
                <button style={styles.buttonDelete} onClick={() => eliminarEmprendimiento(emp._id)}>Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORMULARIO PRODUCTO */}
      <div style={styles.formContainer}>
        <h2 style={styles.title}>{modoEdicionProducto ? "Editar Producto" : "Crear Producto"}</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmitProducto} style={styles.form}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            step="0.01"
            value={form.precio}
            onChange={handleChange}
            required
            min="0"
            style={styles.input}
          />
          <input
            type="text"
            name="imagen"
            placeholder="URL Imagen"
            value={form.imagen}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            style={styles.input}
          />
          <div style={styles.buttonRow}>
            <button type="submit" style={styles.buttonCreate}>
              {modoEdicionProducto ? "Actualizar Producto" : "Crear Producto"}
            </button>
            {modoEdicionProducto && (
              <button type="button" onClick={resetFormProducto} style={styles.buttonCancel}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA PRODUCTOS */}
      <div style={styles.listaContainer}>
        {loading ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No tienes productos aún.</p>
        ) : (
          productos.map((prod) => (
            <div key={prod._id} style={styles.productoCard}>
              <div>
                <strong>{prod.nombre}</strong>
                <p>{prod.descripcion}</p>
                <p>
                  Precio: <b>${prod.precio.toFixed(2)}</b>
                </p>
                <p>Stock: {prod.stock}</p>
                {prod.imagen && <img src={prod.imagen} alt={prod.nombre} style={styles.imagen} />}
              </div>
              <div style={styles.buttonsCard}>
                <button style={styles.buttonEdit} onClick={() => editarProducto(prod)}>
                  Editar
                </button>
                <button style={styles.buttonDelete} onClick={() => eliminarProducto(prod._id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

const styles = {
  formContainer: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    width: "100%",
    maxWidth: "750px",
    margin: "auto",
    fontFamily: "'Playfair Display', serif",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "600",
    color: "#3B2F2F",
    marginBottom: "1rem",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    fontFamily: "'Arial', sans-serif",
    color: "#333",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "10px",
    fontSize: "1rem",
  },
  buttonCreate: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#AA4A44",
    color: "white",
    border: "none",
    borderRadius: "25px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonCancel: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#ccc",
    color: "#333",
    border: "none",
    borderRadius: "25px",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonCreateHover: {
    backgroundColor: "#8b3b3b",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1rem",
  },
  listaContainer: {
    maxWidth: 750,
    margin: "1.5rem auto 0 auto",
    padding: 15,
    display: "flex",
    flexWrap: "wrap",
    gap: 15,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    justifyContent: "space-between",
  },
  productoCard: {
    flex: "1 1 calc(25% - 15px)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 15,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    maxWidth: "calc(25% - 15px)",
    minWidth: "180px",
  },
  imagen: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: 6,
    marginTop: 10,
  },
  buttonsCard: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: "auto",
  },
  buttonEdit: {
    backgroundColor: "#ffc107",
    border: "none",
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buttonDelete: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 4,
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontWeight: "600",
    textAlign: "center",
  },
};
