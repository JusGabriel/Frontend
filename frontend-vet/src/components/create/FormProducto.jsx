import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";

// Componente responsive usando TailwindCSS
// Requisitos: tener Tailwind configurado en el proyecto.

export default function FormProducto() {
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
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState("");
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
      setProductos(res.data || []);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data || [];
      const soloMios = data.filter((emp) => {
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
    setForm({ nombre: "", descripcion: "", precio: "", imagen: "", stock: "" });
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
          emprendimiento: selectedEmprendimiento,
        },
        { headers: { Authorization: `Bearer ${token}` } }
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

    if (producto.emprendimiento) {
      const empId = typeof producto.emprendimiento === "object" ? producto.emprendimiento._id : producto.emprendimiento;
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
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.delete(`https://backend-production-bd1d.up.railway.app/api/productos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
            lat: parseFloat(formEmprendimiento.ubicacion.lat) || 0,
            lng: parseFloat(formEmprendimiento.ubicacion.lng) || 0,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
            lat: parseFloat(formEmprendimiento.ubicacion.lat) || 0,
            lng: parseFloat(formEmprendimiento.ubicacion.lng) || 0,
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.delete(`https://backend-production-bd1d.up.railway.app/api/emprendimientos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
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
    <div className="max-w-6xl mx-auto p-4">
      {/* Emprendimiento: formulario + lista */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3">{modoEdicionEmp ? "Editar Emprendimiento" : "Crear Emprendimiento"}</h2>
        {error && <p className="text-red-600 font-semibold mb-3">{error}</p>}

        <form onSubmit={handleSubmitEmprendimiento} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombreComercial" placeholder="Nombre Comercial" value={formEmprendimiento.nombreComercial} onChange={handleChangeEmprendimiento} required className="input-base col-span-1 md:col-span-2" />

          <textarea name="descripcion" placeholder="Descripción" value={formEmprendimiento.descripcion} onChange={handleChangeEmprendimiento} rows={3} className="input-base col-span-1 md:col-span-2" />

          <input name="logo" placeholder="URL Logo" value={formEmprendimiento.logo} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="direccion" placeholder="Dirección" value={formEmprendimiento.ubicacion.direccion} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="ciudad" placeholder="Ciudad" value={formEmprendimiento.ubicacion.ciudad} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="lat" type="number" step="any" placeholder="Latitud (ej: -0.180653)" value={formEmprendimiento.ubicacion.lat} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="lng" type="number" step="any" placeholder="Longitud (ej: -78.467834)" value={formEmprendimiento.ubicacion.lng} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="telefono" placeholder="Teléfono" value={formEmprendimiento.contacto.telefono} onChange={handleChangeEmprendimiento} className="input-base" />

          <input name="email" type="email" placeholder="Email" value={formEmprendimiento.contacto.email} onChange={handleChangeEmprendimiento} className="input-base" />

          <div className="flex gap-3 justify-end md:col-span-2">
            <button type="submit" className="btn-primary">{modoEdicionEmp ? "Actualizar Emprendimiento" : "Crear Emprendimiento"}</button>
            {modoEdicionEmp && <button type="button" onClick={resetFormEmprendimiento} className="btn-secondary">Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 mb-4">Tus Emprendimientos</h3>
        {loadingEmprendimientos ? (
          <p className="text-slate-500">Cargando emprendimientos...</p>
        ) : emprendimientos.length === 0 ? (
          <p className="text-slate-500">No tienes emprendimientos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emprendimientos.map((emp) => (
              <article key={emp._id} className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="h-36 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {emp.logo ? (
                    <img src={emp.logo} alt={emp.nombreComercial} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-bold">{emp.nombreComercial?.charAt(0) || 'E'}</div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-slate-900 mb-1 truncate">{emp.nombreComercial}</h4>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-2">{emp.descripcion}</p>
                  <div className="text-sm text-slate-500 mt-auto">
                    <p className="truncate"><strong>Dirección:</strong> {emp.ubicacion?.direccion || '-'}</p>
                    <p className="truncate"><strong>Ciudad:</strong> {emp.ubicacion?.ciudad || '-'}</p>
                    <p className="truncate"><strong>Contacto:</strong> {emp.contacto?.telefono || '-'} | {emp.contacto?.email || '-'}</p>
                  </div>
                  <div className="flex gap-2 justify-end mt-3">
                    <button onClick={() => editarEmprendimiento(emp)} className="btn-warning">Editar</button>
                    <button onClick={() => eliminarEmprendimiento(emp._id)} className="btn-danger">Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* FORMULARIO PRODUCTO */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3">{modoEdicionProducto ? "Editar Producto" : "Crear Producto"}</h2>
        {error && <p className="text-red-600 font-semibold mb-3">{error}</p>}

        <form onSubmit={handleSubmitProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required className="input-base col-span-1 md:col-span-2" />

          <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={3} className="input-base col-span-1 md:col-span-2" />

          <input name="precio" type="number" placeholder="Precio" step="0.01" value={form.precio} onChange={handleChange} required min="0" className="input-base" />

          <input name="imagen" placeholder="URL Imagen" value={form.imagen} onChange={handleChange} className="input-base" />

          <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} min="0" className="input-base" />

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-slate-700 mb-1">Selecciona el emprendimiento</label>
            <select value={selectedEmprendimiento} onChange={handleChangeEmprSeleccion} className="input-base w-full" required>
              <option value="">-- Selecciona el emprendimiento --</option>
              {emprendimientos.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.nombreComercial}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end md:col-span-2">
            <button type="submit" className="btn-primary">{modoEdicionProducto ? "Actualizar Producto" : "Crear Producto"}</button>
            {modoEdicionProducto && <button type="button" onClick={resetFormProducto} className="btn-secondary">Cancelar</button>}
          </div>
        </form>
      </div>

      {/* LISTA PRODUCTOS */}
      <div>
        <h3 className="text-2xl font-black text-slate-900 mb-4">Tus Productos</h3>
        {loading ? (
          <p className="text-slate-500">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="text-slate-500">No tienes productos aún.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((prod) => (
              <article key={prod._id} className="bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="h-40 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white text-2xl font-bold">{prod.nombre?.charAt(0) || 'P'}</div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h4 className="font-semibold text-slate-900 mb-1 truncate">{prod.nombre}</h4>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-2">{prod.descripcion}</p>
                  <p className="text-sm text-slate-700 mt-auto"><strong>Precio:</strong> <span className="text-emerald-700 font-bold">${Number(prod.precio).toFixed(2)}</span></p>
                  <p className="text-sm text-slate-500">Stock: {prod.stock}</p>
                  <p className="text-sm text-slate-500">Emprendimiento: {prod.emprendimiento?.nombreComercial || '-'}</p>

                  <div className="flex gap-2 justify-end mt-3">
                    <button onClick={() => editarProducto(prod)} className="btn-warning">Editar</button>
                    <button onClick={() => eliminarProducto(prod._id)} className="btn-danger">Eliminar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Tailwind helper classes injected as style fallback for projects that don't have every plugin */}
      <style jsx>{`
        /* Simple local style overrides for input/button base when Tailwind utilities are present or not. */
        .input-base { @apply px-3 py-2 border rounded-md text-sm bg-white border-slate-200 outline-none focus:ring-2 focus:ring-emerald-200; }
        .btn-primary { @apply px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700; }
        .btn-secondary { @apply px-4 py-2 rounded-md bg-slate-100 text-slate-800 font-medium hover:bg-slate-200; }
        .btn-warning { @apply px-3 py-1 rounded-md bg-amber-500 text-white text-sm; }
        .btn-danger { @apply px-3 py-1 rounded-md bg-red-600 text-white text-sm; }
        .btn-warning:hover, .btn-danger:hover { transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
