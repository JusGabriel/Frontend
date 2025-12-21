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
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState(""); // <-- id seleccionado
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
    } catch (err) {
      console.error(err);
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

      // Filtrar solo los emprendimientos que pertenecen al usuario autenticado (el backend puede devolver 'emprendedor' poblado o solo el id)
      const data = res.data || [];
      const soloMios = data.filter(emp => {
        if (!emp) return false;
        // emp.emprendedor puede venir como id o objeto
        const ownerId = emp.emprendedor && emp.emprendedor._id ? emp.emprendedor._id : emp.emprendedor;
        return ownerId && ownerId.toString() === emprendedorId?.toString();
      });

      setEmprendimientos(soloMios);

      // si no hay selección y existe al menos un emprendimiento, seleccionar el primero por defecto
      if (soloMios.length > 0 && !selectedEmprendimiento) {
        setSelectedEmprendimiento(soloMios[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar emprendimientos");
    } finally {
      setLoadingEmprendimientos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarEmprendimientos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emprendedorId]);

  // --- Manejo inputs productos ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Manejo select emprendimiento para producto ---
  const handleChangeEmprSeleccion = (e) => {
    setSelectedEmprendimiento(e.target.value);
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
    // mantener selección de emprendimiento actual (opcional) o resetear:
    // setSelectedEmprendimiento("");
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
    if (!selectedEmprendimiento) {
      setError("Debes seleccionar el emprendimiento donde guardar el producto");
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
          emprendimiento: selectedEmprendimiento
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetFormProducto();
    } catch (err) {
      console.error(err);
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

    // si el producto trae su emprendimiento, seleccionarlo en el select
    if (producto.emprendimiento) {
      const empId = typeof producto.emprendimiento === 'object' ? producto.emprendimiento._id : producto.emprendimiento;
      setSelectedEmprendimiento(empId);
    }

    setError(null);
  };

  // --- Actualizar producto ---
  const actualizarProducto = async () => {
    if (!token || !productoEditId) {
      setError("No autenticado o producto inválido");
      return;
    }
    if (!selectedEmprendimiento) {
      setError("Debes seleccionar el emprendimiento donde guardar el producto");
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
          // NOTA: el backend actual no permite cambiar emprendimiento en update a menos que lo implementes;
          // si permites cambiarlo, envía `emprendimiento: selectedEmprendimiento`
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetFormProducto();
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
        <h3 style={{ width: "100%", marginBottom: 12 }}>Tus Emprendimientos</h3>
        {loadingEmprendimientos ? (
          <p style={styles.muted}>Cargando emprendimientos...</p>
        ) : emprendimientos.length === 0 ? (
          <p style={styles.muted}>No tienes emprendimientos aún.</p>
        ) : (
          <div style={styles.grid}>
            {emprendimientos.map((emp) => (
              <div key={emp._id} style={styles.card}>
                <div style={styles.cardTop}>
                  {/* Logo container con tamaño fijo */}
                  <div style={styles.logoContainer}>
                    {emp.logo ? (
                      <img
                        src={emp.logo}
                        alt={emp.nombreComercial}
                        style={styles.logoImage}
                        loading="lazy"
                      />
                    ) : (
                      <div style={styles.logoPlaceholder} aria-hidden="true">
                        {emp.nombreComercial?.charAt(0) || "E"}
                      </div>
                    )}
                  </div>

                  <div style={styles.cardInfo}>
                    <strong style={styles.cardTitle}>{emp.nombreComercial}</strong>
                    <p style={styles.cardDesc}>{emp.descripcion}</p>
                    <p style={styles.small}>
                      <b>Dirección:</b> {emp.ubicacion?.direccion || "-"}, <b>Ciudad:</b> {emp.ubicacion?.ciudad || "-"}
                    </p>
                    <p style={styles.small}>
                      <b>Contacto:</b> {emp.contacto?.telefono || "-"} | {emp.contacto?.email || "-"}
                    </p>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.buttonEdit} onClick={() => editarEmprendimiento(emp)}>Editar</button>
                  <button style={styles.buttonDelete} onClick={() => eliminarEmprendimiento(emp._id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
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

          {/* SELECT DE EMPRENDIMIENTOS (propios del usuario) */}
          <label style={{ fontSize: 14, marginTop: 6 }}>Selecciona el emprendimiento</label>
          <select
            value={selectedEmprendimiento}
            onChange={handleChangeEmprSeleccion}
            style={{ ...styles.input, appearance: 'menulist' }}
            required
          >
            <option value="">-- Selecciona el emprendimiento --</option>
            {emprendimientos.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.nombreComercial}</option>
            ))}
          </select>

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
        <h3 style={{ width: "100%", marginBottom: 12 }}>Tus Productos</h3>
        {loading ? (
          <p style={styles.muted}>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p style={styles.muted}>No tienes productos aún.</p>
        ) : (
          <div style={styles.grid}>
            {productos.map((prod) => (
              <div key={prod._id} style={styles.card}>
                <div style={styles.productImageWrap}>
                  {/* Contenedor fijo para imagen: todas las imágenes tendrán el mismo tamaño visual */}
                  {prod.imagen ? (
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      style={styles.productImage}
                      loading="lazy"
                    />
                  ) : (
                    <div style={styles.productPlaceholder}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                        {prod.nombre?.charAt(0) || "P"}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <strong style={styles.cardTitle}>{prod.nombre}</strong>
                  <p style={styles.cardDesc}>{prod.descripcion}</p>
                  <p style={styles.price}>Precio: <span style={styles.priceValue}>${Number(prod.precio).toFixed(2)}</span></p>
                  <p style={styles.small}>Stock: {prod.stock}</p>
                  <p style={styles.small}>Emprendimiento: {prod.emprendimiento?.nombreComercial || "-"}</p>
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.buttonEdit} onClick={() => editarProducto(prod)}>
                    Editar
                  </button>
                  <button style={styles.buttonDelete} onClick={() => eliminarProducto(prod._id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// styles mejorados (solo CSS-in-JS)
const styles = {
  // Form container
  formContainer: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(12,12,15,0.07)",
    width: "100%",
    maxWidth: "920px",
    margin: "24px auto",
    fontFamily: "'Inter', system-ui, Aerial, sans-serif",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1F2937",
    marginBottom: "0.75rem",
    textAlign: "left",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    color: "#111827",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "0.98rem",
    outline: "none",
    transition: "box-shadow .12s ease, border-color .12s ease",
  },
  inputFocus: {
    boxShadow: "0 6px 18px rgba(79,70,229,0.06)",
    borderColor: "#6366F1",
  },

  // Buttons
  buttonCreate: {
    padding: "10px 16px",
    backgroundColor: "#0F766E",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.98rem",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(15,118,110,0.18)",
    transition: "transform .12s ease, box-shadow .12s ease, opacity .12s ease",
  },
  buttonCancel: {
    padding: "10px 16px",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    border: "none",
    borderRadius: "10px",
    fontSize: "0.98rem",
    cursor: "pointer",
    transition: "background-color .12s ease",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "0.75rem",
  },

  // General containers
  listaContainer: {
    maxWidth: 920,
    margin: "1.5rem auto 0 auto",
    padding: 15,
    fontFamily: "'Inter', system-ui, Aerial, sans-serif",
  },
  muted: {
    color: "#6B7280",
    fontSize: "0.95rem",
    textAlign: "center",
    margin: "12px 0",
  },

  // Grid layout for lists
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    alignItems: "stretch",
  },

  // Card
  card: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    border: "1px solid #E6E9EE",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 6px 18px rgba(14,18,35,0.04)",
    minHeight: 220,
  },
  cardTop: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: "1.02rem",
    color: "#0F172A",
    marginBottom: 6,
    display: "block",
  },
  cardDesc: {
    color: "#4B5563",
    fontSize: "0.92rem",
    marginBottom: 8,
    minHeight: 38,
  },
  small: {
    fontSize: "0.85rem",
    color: "#6B7280",
    margin: 0,
  },

  // Logo / Image containers (fixed size for consistent UI)
  logoContainer: {
    width: 86,
    height: 86,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #EEF2F7",
    flexShrink: 0,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9CA3AF",
    color: "#fff",
    fontWeight: 700,
    fontSize: 22,
  },

  // PRODUCTO: imagen superior
  productImageWrap: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #E6E9EE",
    marginBottom: 10,
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  productPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155",
  },

  // Card body for product text
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  price: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#111827",
  },
  priceValue: {
    color: "#0F766E",
    fontWeight: 700,
  },

  // Actions area (aligned below content)
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  buttonEdit: {
    backgroundColor: "#F59E0B",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "transform .12s ease",
  },
  buttonDelete: {
    backgroundColor: "#DC2626",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "transform .12s ease",
  },

  // Utilities
  error: {
    color: "#B91C1C",
    marginBottom: 8,
    fontWeight: 700,
    textAlign: "center",
  },
};
