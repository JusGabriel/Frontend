import React, { useState, useEffect } from "react";
import axios from "axios";
import storeAuth from "../../context/storeAuth";

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
    } catch (err) {
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: "",
      stock: "",
    });
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear producto");
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al eliminar producto");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      actualizarProducto();
    } else {
      crearProducto();
    }
  };

return (
  <div className="max-w-[1200px] mx-auto p-6 flex flex-col md:flex-row gap-12">
    {/* Formulario */}
    <section className="flex-[0_0_45%] bg-[#F7E5D2] p-8 rounded-xl shadow-inner">
      {/* Header formulario ocupando todo el ancho */}
      <h2 className="text-3xl font-bold text-[#AA4A44] mb-8 border-b-4 border-[#AA4A44] pb-3 w-full text-center">
        Mis Productos
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-gray-800">
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded mb-6">{error}</p>
        )}

        <input
          className="p-3 rounded border border-gray-300 focus:border-[#AA4A44] focus:outline-none text-lg"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          className="p-3 rounded border border-gray-300 focus:border-[#AA4A44] focus:outline-none text-lg"
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
        />
        <input
          className="p-3 rounded border border-gray-300 focus:border-[#AA4A44] focus:outline-none text-lg"
          name="precio"
          placeholder="Precio"
          type="number"
          step="0.01"
          value={form.precio}
          onChange={handleChange}
          required
          min="0"
        />
        <input
          className="p-3 rounded border border-gray-300 focus:border-[#AA4A44] focus:outline-none text-lg"
          name="imagen"
          placeholder="URL Imagen"
          value={form.imagen}
          onChange={handleChange}
        />
        <input
          className="p-3 rounded border border-gray-300 focus:border-[#AA4A44] focus:outline-none text-lg"
          name="stock"
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          min="0"
        />

        <div className="flex justify-end gap-6 mt-6">
          <button
            type="submit"
            className="bg-[#AA4A44] hover:bg-[#933834] text-white font-semibold py-3 px-8 rounded transition"
          >
            {modoEdicion ? "Actualizar" : "Crear"}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-8 rounded transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </section>

    {/* Lista de productos */}
    <section className="flex-[0_0_55%]">
      <h2 className="text-3xl font-bold text-[#AA4A44] mb-8 border-b-4 border-[#AA4A44] pb-3 w-full text-center">
        Mis Productos
      </h2>

      <div className="flex flex-col gap-8">
        {loading ? (
          <p className="text-center text-gray-600">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p className="text-center text-gray-600">No tienes productos aún.</p>
        ) : (
          productos.map((prod) => (
            <div
              key={prod._id}
              className="bg-white border border-[#E0C7B6] rounded-xl p-6 shadow hover:shadow-lg transition flex gap-6 items-center"
            >
              <div className="w-1 bg-[#AA4A44] rounded-l-xl" />

              {prod.imagen ? (
                <img
                  src={prod.imagen}
                  alt={prod.nombre}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                  Sin imagen
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-xl text-[#AA4A44]">{prod.nombre}</h3>
                <p className="text-base text-gray-700">{prod.descripcion}</p>
                <p className="mt-2 text-[#28a745] font-bold text-lg">${prod.precio.toFixed(2)}</p>
                <p className="text-base text-gray-600">Stock: {prod.stock}</p>
                <p className="text-base text-gray-600">
                  Categoría: {prod.categoria ? prod.categoria.nombre || prod.categoria : "N/A"}
                </p>
              </div>

              <div className="flex flex-col gap-4 min-w-[120px]">
                <button
                  onClick={() => editarProducto(prod)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarProducto(prod._id)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
                >
                  Borrar
                </button>
                <button
                  onClick={() => alert(`Comprando: ${prod.nombre}`)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
                >
                  Comprar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  </div>
);
};


