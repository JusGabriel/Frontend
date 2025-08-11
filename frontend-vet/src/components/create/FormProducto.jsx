import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";
import fondoBlanco from '../../assets/fondoblanco.jpg';

export const FormProducto = () => {
  const { token, id: emprendedorId } = storeAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    stock: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditId, setProductoEditId] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    cargarProductos();
  }, [emprendedorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ nombre: "", descripcion: "", precio: "", imagen: "", stock: "" });
    setModoEdicion(false);
    setProductoEditId(null);
    setError(null);
  };

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarProductos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear producto");
    }
  };

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarProductos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al actualizar producto");
    }
  };

  const eliminarProducto = async (id) => {
    if (!token) {
      setError("No autenticado");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await axios.delete(
        `https://backend-production-bd1d.up.railway.app/api/productos/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar producto");
    }
  };

  const editarProducto = (producto) => {
    setModoEdicion(true);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    modoEdicion ? actualizarProducto() : crearProducto();
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto bg-white bg-opacity-95 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center mb-8 text-[#AA4A44]">
          {modoEdicion ? "Editar Producto" : "Crear Producto"}
        </h2>

        {error && (
          <p className="mb-4 text-center text-red-600 font-semibold">{error}</p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="border border-[#AA4A44] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            step="0.01"
            min="0"
            value={form.precio}
            onChange={handleChange}
            required
            className="border border-[#AA4A44] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />
          <input
            type="text"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            className="border border-[#AA4A44] rounded-md px-4 py-2 col-span-full focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />
          <input
            type="text"
            name="imagen"
            placeholder="URL Imagen"
            value={form.imagen}
            onChange={handleChange}
            className="border border-[#AA4A44] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            min="0"
            value={form.stock}
            onChange={handleChange}
            className="border border-[#AA4A44] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />

          <div className="flex items-center justify-end col-span-full gap-4 mt-4">
            {modoEdicion && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md transition"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-[#AA4A44] hover:bg-[#933834] text-white px-6 py-2 rounded-md font-semibold transition"
            >
              {modoEdicion ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-[#AA4A44]">
            Mis Productos
          </h3>

          {loading ? (
            <p className="text-center text-gray-700">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="text-center text-gray-700">No tienes productos aún.</p>
          ) : (
            <div className="space-y-6">
              {productos.map((prod) => (
                <div
                  key={prod._id}
                  className="bg-white border border-[#E0C7B6] rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center gap-6"
                >
                  {prod.imagen && (
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      className="w-full md:w-48 h-36 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-[#AA4A44]">{prod.nombre}</h4>
                    <p className="text-gray-600 mt-1">{prod.descripcion}</p>
                    <p className="mt-2 font-semibold text-[#4a9716]">
                      Precio: ${prod.precio.toFixed(2)}
                    </p>
                    <p>Stock: {prod.stock}</p>
                    <p className="italic text-sm text-gray-500">
                      Categoría: {prod.categoria ? prod.categoria.nombre || prod.categoria : "N/A"}
                    </p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => editarProducto(prod)}
                      className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-md font-semibold text-black transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(prod._id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-semibold text-white transition"
                    >
                      Borrar
                    </button>
                    <button
                      onClick={() => alert(`Comprando: ${prod.nombre}`)}
                      className="bg-[#4a9716] hover:bg-[#3b7a14] px-4 py-2 rounded-md font-semibold text-white transition"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
