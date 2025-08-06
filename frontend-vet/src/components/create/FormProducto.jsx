import { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";
import { toast } from "react-toastify";

const API_BASE_URL = "https://backend-production-bd1d.up.railway.app/api/productos";

export const ProductosDashboard = () => {
  const { token, id: emprendedorId, rol } = storeAuth();

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    categoria: "",
    stock: "",
  });
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Configuración axios con token en headers para requests autenticados
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Obtener productos de este emprendedor
  const cargarProductos = async () => {
    try {
      setLoading(true);
      // Aquí usas el endpoint que busca productos por emprendedor
      const res = await axios.get(`${API_BASE_URL}/emprendedor/${emprendedorId}`);
      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error al cargar productos");
      console.error(error);
    }
  };

  useEffect(() => {
    if (emprendedorId && token && rol === "emprendedor") {
      cargarProductos();
    }
  }, [emprendedorId, token, rol]);

  // Manejo del formulario para crear o actualizar producto
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Crear producto
  const handleCrearProducto = async () => {
    try {
      if (!form.nombre || !form.precio) {
        toast.warn("Debe ingresar al menos nombre y precio");
        return;
      }

      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        imagen: form.imagen,
        categoria: form.categoria,
        stock: Number(form.stock),
      };

      const res = await axios.post(API_BASE_URL, body, axiosConfig);
      toast.success("Producto creado");
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: "",
        categoria: "",
        stock: "",
      });
      cargarProductos();
    } catch (error) {
      toast.error("Error al crear producto");
      console.error(error);
    }
  };

  // Preparar formulario para editar
  const editarProducto = (producto) => {
    setForm({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      imagen: producto.imagen || "",
      categoria: producto.categoria?._id || "",
      stock: producto.stock || "",
    });
    setEditandoId(producto._id);
  };

  // Actualizar producto
  const handleActualizarProducto = async () => {
    try {
      if (!editandoId) return;

      const body = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        imagen: form.imagen,
        categoria: form.categoria,
        stock: Number(form.stock),
      };

      const res = await axios.put(`${API_BASE_URL}/${editandoId}`, body, axiosConfig);
      toast.success("Producto actualizado");
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: "",
        categoria: "",
        stock: "",
      });
      setEditandoId(null);
      cargarProductos();
    } catch (error) {
      toast.error("Error al actualizar producto");
      console.error(error);
    }
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    try {
      if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

      await axios.delete(`${API_BASE_URL}/${id}`, axiosConfig);
      toast.success("Producto eliminado");
      cargarProductos();
    } catch (error) {
      toast.error("Error al eliminar producto");
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{editandoId ? "Editar Producto" : "Crear Producto"}</h2>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />
      <br />
      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={handleChange}
      />
      <br />
      <input
        type="number"
        name="precio"
        placeholder="Precio"
        value={form.precio}
        onChange={handleChange}
      />
      <br />
      <input
        type="text"
        name="imagen"
        placeholder="URL imagen"
        value={form.imagen}
        onChange={handleChange}
      />
      <br />
      <input
        type="text"
        name="categoria"
        placeholder="ID Categoría"
        value={form.categoria}
        onChange={handleChange}
      />
      <br />
      <input
        type="number"
        name="stock"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
      />
      <br />
      {editandoId ? (
        <>
          <button onClick={handleActualizarProducto}>Actualizar Producto</button>
          <button
            onClick={() => {
              setForm({
                nombre: "",
                descripcion: "",
                precio: "",
                imagen: "",
                categoria: "",
                stock: "",
              });
              setEditandoId(null);
            }}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button onClick={handleCrearProducto}>Crear Producto</button>
      )}

      <hr />

      <h3>Mis Productos</h3>
      {loading && <p>Cargando productos...</p>}
      {productos.length === 0 && !loading && <p>No hay productos.</p>}
      <ul>
        {productos.map((p) => (
          <li key={p._id} style={{ marginBottom: 10 }}>
            <strong>{p.nombre}</strong> - Precio: ${p.precio} - Stock: {p.stock} <br />
            <button onClick={() => editarProducto(p)}>Editar</button>{" "}
            <button onClick={() => eliminarProducto(p._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
