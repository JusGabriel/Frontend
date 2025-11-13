import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  // Cargar productos
  useEffect(() => {
    axios
      .get("https://backend-production-bd1d.up.railway.app/api/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // Cargar emprendimientos
  useEffect(() => {
    axios
      .get("https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos")
      .then((res) => setEmprendimientos(res.data))
      .catch((err) => console.error("Error cargando emprendimientos:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#333]">
      {/* Banner principal */}
      <section className="relative w-full h-[60vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#AA4A44] to-[#E0C7B6] text-white">
        <h1 className="text-5xl font-bold mb-4">QuitoEmprende</h1>
        <p className="text-lg max-w-2xl">
          Apoya a los emprendedores locales descubriendo productos únicos y proyectos innovadores.
        </p>
      </section>

      {/* Productos */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-[#AA4A44] mb-8 text-center">
          Productos Destacados
        </h2>

        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.slice(0, 6).map((producto) => (
              <div
                key={producto._id}
                className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all flex flex-col cursor-pointer"
                onClick={() => setProductoSeleccionado(producto)}
              >
                <img
                  src={producto.imagen || "https://via.placeholder.com/300"}
                  alt={producto.nombre}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-[#AA4A44]">{producto.nombre}</h3>
                <p className="text-gray-600 line-clamp-2">{producto.descripcion}</p>
                <p className="font-bold text-[#28a745] mt-2">${producto.precio}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay productos disponibles</p>
        )}
      </section>

      {/* Emprendimientos */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-[#AA4A44] mb-8 text-center">
          Explora Emprendimientos
        </h2>

        {emprendimientos.length > 0 ? (
          <div className="flex overflow-x-auto space-x-6 pb-4 px-2">
            {emprendimientos.map((emp) => (
              <div
                key={emp._id}
                className="min-w-[280px] bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
                onClick={() => setEmprendimientoSeleccionado(emp)}
              >
                <img
                  src={emp.logo || "https://via.placeholder.com/300"}
                  alt={emp.nombre}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombre}</h3>
                <p className="text-gray-600 line-clamp-2">{emp.descripcion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay emprendimientos disponibles</p>
        )}
      </section>

      {/* Modal de Producto */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-[#E0C7B6] max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            <img
              src={productoSeleccionado.imagen || "https://via.placeholder.com/400"}
              alt={productoSeleccionado.nombre}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-bold text-[#AA4A44]">
              {productoSeleccionado.nombre}
            </h2>
            <p className="text-gray-700 mt-2">{productoSeleccionado.descripcion}</p>
            <p className="font-bold text-[#28a745] mt-4 text-lg">
              ${productoSeleccionado.precio}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Emprendimiento */}
      {emprendimientoSeleccionado && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50"
          onClick={() => setEmprendimientoSeleccionado(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-[#E0C7B6] max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEmprendimientoSeleccionado(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
            <img
              src={emprendimientoSeleccionado.logo || "https://via.placeholder.com/400"}
              alt={emprendimientoSeleccionado.nombre}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-bold text-[#AA4A44]">
              {emprendimientoSeleccionado.nombre}
            </h2>
            <p className="text-gray-700 mt-2">{emprendimientoSeleccionado.descripcion}</p>
            {emprendimientoSeleccionado.categoria && (
              <p className="mt-3 font-semibold text-[#AA4A44]">
                Categoría: {emprendimientoSeleccionado.categoria}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
