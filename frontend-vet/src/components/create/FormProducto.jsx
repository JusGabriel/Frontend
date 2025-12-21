import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";

const API_BASE = "https://backend-production-bd1d.up.railway.app";

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
    imagen: "", // URL fallback (compatibilidad)
    stock: "",
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);

  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState("");
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false);
  const [productoEditId, setProductoEditId] = useState(null);

  // Emprendimientos - formulario
  const [formEmprendimiento, setFormEmprendimiento] = useState({
    nombreComercial: "",
    descripcion: "",
    logo: "", // URL fallback
    ubicacion: { direccion: "", ciudad: "", lat: "", lng: "" },
    contacto: { telefono: "", email: "", sitioWeb: "", facebook: "", instagram: "" },
    categorias: [],
    estado: "Activo",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [modoEdicionEmp, setModoEdicionEmp] = useState(false);
  const [emprendimientoEditId, setEmprendimientoEditId] = useState(null);

  // --- CARGA INICIAL ---
  const cargarProductos = async () => {
    if (!emprendedorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/productos/emprendedor/${emprendedorId}`);
      setProductos(res.data);
    } catch (err) {
      console.error(err);
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const cargarEmprendimientos = async () => {
    setLoadingEmprendimientos(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/emprendimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      const soloMios = data.filter(emp => {
        if (!emp) return false;
        const ownerId = emp.emprendedor && emp.emprendedor._id ? emp.emprendedor._id : emp.emprendedor;
        return ownerId && ownerId.toString() === emprendedorId?.toString();
      });
      setEmprendimientos(soloMios);
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
    // cleanup previews on unmount
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (productImagePreview) URL.revokeObjectURL(productImagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emprendedorId]);

  // --- MANEJO INPUTS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeEmprSeleccion = (e) => {
    setSelectedEmprendimiento(e.target.value);
  };

  const handleChangeEmprendimiento = (e) => {
    const { name, value } = e.target;
    if (["direccion", "ciudad", "lat", "lng"].includes(name)) {
      setFormEmprendimiento(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, [name]: value } }));
    } else if (["telefono", "email", "sitioWeb", "facebook", "instagram"].includes(name)) {
      setFormEmprendimiento(prev => ({ ...prev, contacto: { ...prev.contacto, [name]: value } }));
    } else {
      setFormEmprendimiento(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- MANEJO ARCHIVOS Y PREVIEWS ---
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    setLogoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleProductImageFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
      setProductImagePreview(null);
    }
    setProductImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProductImagePreview(url);
    }
  };

  // --- RESET FORMULARIOS ---
  const resetFormProducto = () => {
    setForm({ nombre: "", descripcion: "", precio: "", imagen: "", stock: "" });
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
      setProductImagePreview(null);
    }
    setProductImageFile(null);
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
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    setLogoFile(null);
    setModoEdicionEmp(false);
    setEmprendimientoEditId(null);
    setError(null);
  };

  // --- PRODUCTOS: crear / actualizar / eliminar (usando FormData cuando hay archivo) ---
  const crearProducto = async () => {
    if (!token) { setError("No autenticado"); return; }
    if (!selectedEmprendimiento) { setError("Debes seleccionar el emprendimiento donde guardar el producto"); return; }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion || "");
      formData.append("precio", form.precio !== "" ? String(form.precio) : "0");
      formData.append("stock", form.stock !== "" ? String(form.stock) : "0");
      formData.append("categoria", ""); // si manejas categorías ajusta esto
      formData.append("emprendimiento", selectedEmprendimiento);

      if (productImageFile) {
        formData.append("imagen", productImageFile);
      } else if (form.imagen) {
        formData.append("imagen", form.imagen); // compatibilidad URL
      }

      await axios.post(`${API_BASE}/api/productos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await cargarProductos();
      resetFormProducto();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al crear producto");
    }
  };

  const actualizarProducto = async () => {
    if (!token || !productoEditId) { setError("No autenticado o producto inválido"); return; }
    if (!selectedEmprendimiento) { setError("Debes seleccionar el emprendimiento donde guardar el producto"); return; }

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion || "");
      formData.append("precio", form.precio !== "" ? String(form.precio) : "0");
      formData.append("stock", form.stock !== "" ? String(form.stock) : "0");
      if (productImageFile) formData.append("imagen", productImageFile);

      await axios.put(`${API_BASE}/api/productos/${productoEditId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await cargarProductos();
      resetFormProducto();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al actualizar producto");
    }
  };

  const eliminarProducto = async (id) => {
    if (!token) { setError("No autenticado"); return; }
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await axios.delete(`${API_BASE}/api/productos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await cargarProductos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al eliminar producto");
    }
  };

  // --- EMPRENDIMIENTOS: crear / actualizar / eliminar (FormData para logo) ---
  const crearEmprendimiento = async () => {
    if (!token) { setError("No autenticado"); return; }
    try {
      const fd = new FormData();
      fd.append("nombreComercial", formEmprendimiento.nombreComercial);
      fd.append("descripcion", formEmprendimiento.descripcion || "");
      // ubicacion fields using nested keys (controller parsea ubicacion[direccion], etc.)
      fd.append("ubicacion[direccion]", formEmprendimiento.ubicacion.direccion || "");
      fd.append("ubicacion[ciudad]", formEmprendimiento.ubicacion.ciudad || "");
      fd.append("ubicacion[lat]", formEmprendimiento.ubicacion.lat || "");
      fd.append("ubicacion[lng]", formEmprendimiento.ubicacion.lng || "");
      // contacto
      fd.append("contacto[telefono]", formEmprendimiento.contacto.telefono || "");
      fd.append("contacto[email]", formEmprendimiento.contacto.email || "");
      fd.append("contacto[sitioWeb]", formEmprendimiento.contacto.sitioWeb || "");
      fd.append("estado", formEmprendimiento.estado || "Activo");
      // categorias (si manejas array, stringify)
      if (formEmprendimiento.categorias && formEmprendimiento.categorias.length > 0) {
        fd.append("categorias", JSON.stringify(formEmprendimiento.categorias));
      }

      if (logoFile) {
        fd.append("logo", logoFile);
      } else if (formEmprendimiento.logo) {
        fd.append("logo", formEmprendimiento.logo); // compatibilidad URL
      }

      await axios.post(`${API_BASE}/api/emprendimientos`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await cargarEmprendimientos();
      alert("Emprendimiento creado con éxito");
      resetFormEmprendimiento();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al crear emprendimiento");
    }
  };

  const actualizarEmprendimiento = async () => {
    if (!token || !emprendimientoEditId) { setError("No autenticado o emprendimiento inválido"); return; }
    try {
      const fd = new FormData();
      fd.append("nombreComercial", formEmprendimiento.nombreComercial);
      fd.append("descripcion", formEmprendimiento.descripcion || "");
      fd.append("ubicacion[direccion]", formEmprendimiento.ubicacion.direccion || "");
      fd.append("ubicacion[ciudad]", formEmprendimiento.ubicacion.ciudad || "");
      fd.append("ubicacion[lat]", formEmprendimiento.ubicacion.lat || "");
      fd.append("ubicacion[lng]", formEmprendimiento.ubicacion.lng || "");
      fd.append("contacto[telefono]", formEmprendimiento.contacto.telefono || "");
      fd.append("contacto[email]", formEmprendimiento.contacto.email || "");
      fd.append("contacto[sitioWeb]", formEmprendimiento.contacto.sitioWeb || "");
      fd.append("estado", formEmprendimiento.estado || "Activo");
      if (formEmprendimiento.categorias && formEmprendimiento.categorias.length > 0) {
        fd.append("categorias", JSON.stringify(formEmprendimiento.categorias));
      }
      if (logoFile) fd.append("logo", logoFile);

      await axios.put(`${API_BASE}/api/emprendimientos/${emprendimientoEditId}`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await cargarEmprendimientos();
      alert("Emprendimiento actualizado con éxito");
      resetFormEmprendimiento();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al actualizar emprendimiento");
    }
  };

  const eliminarEmprendimiento = async (id) => {
    if (!token) { setError("No autenticado"); return; }
    if (!window.confirm("¿Estás seguro de eliminar este emprendimiento?")) return;
    try {
      await axios.delete(`${API_BASE}/api/emprendimientos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await cargarEmprendimientos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "Error al eliminar emprendimiento");
    }
  };

  // --- Edit handlers cargar en formulario para editar ---
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
    // preview si trae imagen URL
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview);
      setProductImagePreview(null);
    }
    if (producto.imagen) {
      setProductImagePreview(producto.imagen);
    }
    setProductImageFile(null);
    if (producto.emprendimiento) {
      const empId = typeof producto.emprendimiento === "object" ? producto.emprendimiento._id : producto.emprendimiento;
      setSelectedEmprendimiento(empId);
    }
    setError(null);
  };

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
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
    if (emp.logo) setLogoPreview(emp.logo);
    setLogoFile(null);
    setError(null);
  };

  // --- Submit handlers ---
  const handleSubmitProducto = (e) => {
    e.preventDefault();
    if (modoEdicionProducto) actualizarProducto();
    else crearProducto();
  };

  const handleSubmitEmprendimiento = (e) => {
    e.preventDefault();
    if (modoEdicionEmp) actualizarEmprendimiento();
    else crearEmprendimiento();
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

          {/* Upload logo */}
          <label style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>Logo (subir imagen)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            style={styles.inputFile}
          />
          {logoPreview && (
            <div style={{ maxWidth: 160, marginTop: 8 }}>
              <img src={logoPreview} alt="preview logo" style={{ width: "100%", borderRadius: 8 }} />
            </div>
          )}

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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="number"
              step="any"
              name="lat"
              placeholder="Latitud (ej: -0.180653)"
              value={formEmprendimiento.ubicacion.lat}
              onChange={handleChangeEmprendimiento}
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              type="number"
              step="any"
              name="lng"
              placeholder="Longitud (ej: -78.467834)"
              value={formEmprendimiento.ubicacion.lng}
              onChange={handleChangeEmprendimiento}
              style={{ ...styles.input, flex: 1 }}
            />
          </div>
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
        <h3 style={styles.sectionTitle}>Tus Emprendimientos</h3>
        {loadingEmprendimientos ? (
          <p style={styles.muted}>Cargando emprendimientos...</p>
        ) : emprendimientos.length === 0 ? (
          <p style={styles.muted}>No tienes emprendimientos aún.</p>
        ) : (
          <div style={styles.grid}>
            {emprendimientos.map((emp) => (
              <div key={emp._id} style={styles.card}>
                <div style={styles.productImageWrapSmall}>
                  {emp.logo ? (
                    <img src={emp.logo} alt={emp.nombreComercial} style={styles.productImage} loading="lazy" />
                  ) : (
                    <div style={styles.productPlaceholder}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
                        {emp.nombreComercial?.charAt(0) || "E"}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <strong style={styles.cardTitle}>{emp.nombreComercial}</strong>
                  <p style={styles.cardDescClamp}>{emp.descripcion}</p>
                  <p style={styles.small}><b>Dirección:</b> {emp.ubicacion?.direccion || "-"}</p>
                  <p style={styles.small}><b>Ciudad:</b> {emp.ubicacion?.ciudad || "-"}</p>
                  <p style={styles.small}><b>Contacto:</b> {emp.contacto?.telefono || "-"} | {emp.contacto?.email || "-"}</p>
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
          <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required style={styles.input} />
          <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} style={styles.input} />
          <input type="number" name="precio" placeholder="Precio" step="0.01" value={form.precio} onChange={handleChange} required min="0" style={styles.input} />

          {/* Imagen producto */}
          <label style={{ fontSize: 13, color: "#374151", marginTop: 6 }}>Imagen del producto</label>
          <input type="file" accept="image/*" onChange={handleProductImageFileChange} style={styles.inputFile} />
          {productImagePreview && (
            <div style={{ maxWidth: 240, marginTop: 8 }}>
              <img src={productImagePreview} alt="preview producto" style={{ width: "100%", borderRadius: 8 }} />
            </div>
          )}

          <input type="number" name="stock" placeholder="Stock" value={form.stock} onChange={handleChange} min="0" style={styles.input} />

          <label style={{ fontSize: 14, marginTop: 6, color: "#374151" }}>Selecciona el emprendimiento</label>
          <select value={selectedEmprendimiento} onChange={handleChangeEmprSeleccion} style={{ ...styles.input, appearance: 'menulist' }} required>
            <option value="">-- Selecciona el emprendimiento --</option>
            {emprendimientos.map(emp => <option key={emp._id} value={emp._id}>{emp.nombreComercial}</option>)}
          </select>

          <div style={styles.buttonRow}>
            <button type="submit" style={styles.buttonCreate}>{modoEdicionProducto ? "Actualizar Producto" : "Crear Producto"}</button>
            {modoEdicionProducto && (<button type="button" onClick={resetFormProducto} style={styles.buttonCancel}>Cancelar</button>)}
          </div>
        </form>
      </div>

      {/* LISTA PRODUCTOS */}
      <div style={styles.listaContainer}>
        <h3 style={styles.sectionTitle}>Tus Productos</h3>
        {loading ? (<p style={styles.muted}>Cargando productos...</p>) : productos.length === 0 ? (<p style={styles.muted}>No tienes productos aún.</p>) : (
          <div style={styles.grid}>
            {productos.map((prod) => (
              <div key={prod._id || prod._1d} style={styles.card}>
                <div style={styles.productImageWrap}>
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} style={styles.productImage} loading="lazy" />
                  ) : (
                    <div style={styles.productPlaceholder}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{prod.nombre?.charAt(0) || "P"}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <strong style={styles.cardTitle}>{prod.nombre}</strong>
                  <p style={styles.cardDescClamp}>{prod.descripcion}</p>
                  <p style={styles.price}>Precio: <span style={styles.priceValue}>${Number(prod.precio).toFixed(2)}</span></p>
                  <p style={styles.small}>Stock: {prod.stock}</p>
                  <p style={styles.small}>Emprendimiento: {prod.emprendimiento?.nombreComercial || "-"}</p>
                </div>

                <div style={styles.cardActions}>
                  <button style={styles.buttonEdit} onClick={() => editarProducto(prod)}>Editar</button>
                  <button style={styles.buttonDelete} onClick={() => eliminarProducto(prod._id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

// estilos (CSS-in-JS)
const styles = {
  formContainer: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(12,12,15,0.07)",
    width: "100%",
    maxWidth: "920px",
    margin: "24px auto",
    fontFamily: "'Inter', system-ui, Aerial, sans-serif",
    boxSizing: "border-box",
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
    width: "100%",
    boxSizing: "border-box",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "0.98rem",
    outline: "none",
    transition: "box-shadow .12s ease, border-color .12s ease",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  inputFile: {
    padding: "6px 8px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },

  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#0F172A",
    margin: "10px 0 16px 0",
  },

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
  buttonRow: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" },

  listaContainer: { maxWidth: 920, margin: "1.5rem auto 0 auto", padding: 15, fontFamily: "'Inter', system-ui, Aerial, sans-serif" },
  muted: { color: "#6B7280", fontSize: "0.95rem", textAlign: "center", margin: "12px 0" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "stretch" },

  card: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    border: "1px solid #E6E9EE",
    borderRadius: 12,
    padding: 12,
    boxShadow: "0 6px 18px rgba(14,18,35,0.04)",
    minHeight: 280,
    overflow: "hidden",
  },

  productImageWrapSmall: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #E6E9EE",
    marginBottom: 10,
    flexShrink: 0,
  },

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
  productImage: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  productPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#334155" },

  cardBody: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },

  cardTitle: { fontSize: "1.02rem", color: "#0F172A", marginBottom: 4, display: "block", wordBreak: "break-word" },
  cardDesc: { color: "#4B5563", fontSize: "0.92rem", marginBottom: 8, wordBreak: "break-word" },

  cardDescClamp: {
    color: "#4B5563",
    fontSize: "0.92rem",
    marginBottom: 8,
    wordBreak: "break-word",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  small: { fontSize: "0.85rem", color: "#6B7280", margin: 0, wordBreak: "break-word" },

  price: { margin: 0, fontSize: "0.95rem", color: "#111827" },
  priceValue: { color: "#0F766E", fontWeight: 700 },

  cardActions: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 },
  buttonEdit: { backgroundColor: "#F59E0B", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },
  buttonDelete: { backgroundColor: "#DC2626", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" },

  error: { color: "#B91C1C", marginBottom: 8, fontWeight: 700, textAlign: "center" },
};

export default FormProducto;
