import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get(
          "https://backend-production-bd1d.up.railway.app/api/productos/publicos"
        );
        setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos públicos:", error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f5f3] p-6">
      <h1 className="text-3xl font-bold text-center text-[#AA4A44] mb-8">
        Productos Disponibles
      </h1>

      {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {productos.map((producto) => (
          <div
            key={producto._id}
            className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all flex flex-col cursor-pointer"
            onClick={() => setProductoSeleccionado(producto)}
          >
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />

            <h3 className="font-semibold text-lg text-[#AA4A44]">
              {producto.nombre}
            </h3>

            <p className="text-sm text-gray-600">{producto.descripcion}</p>

            <p className="text-[#28a745] font-bold mt-2">${producto.precio}</p>

            <p className="text-sm text-gray-700 mt-1">
              Stock: <span className="font-medium">{producto.stock}</span>
            </p>

            <p className="text-sm mt-3 text-gray-600">
              <span className="font-semibold text-[#AA4A44]">
                Emprendimiento:
              </span>{" "}
              {producto.emprendimiento?.nombreComercial}
            </p>

            <p className="text-sm text-gray-500">
              Publicado por:{" "}
              {producto.emprendimiento?.emprendedor?.nombre}{" "}
              {producto.emprendimiento?.emprendedor?.apellido}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL DEL PRODUCTO */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setProductoSeleccionado(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProductoSeleccionado(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>

            <img
              src={productoSeleccionado.imagen}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-md mb-4"
            />

            <h2 className="text-xl font-bold text-[#AA4A44]">
              {productoSeleccionado.nombre}
            </h2>

            <p className="text-gray-600 mt-2">
              {productoSeleccionado.descripcion}
            </p>

            <p className="font-bold text-[#28a745] mt-3 text-lg">
              ${productoSeleccionado.precio}
            </p>

            <p className="mt-2 text-gray-700">
              <span className="font-semibold">Stock:</span>{" "}
              {productoSeleccionado.stock}
            </p>

            <p className="mt-3 text-gray-700">
              <span className="font-semibold">Emprendimiento:</span>{" "}
              {productoSeleccionado.emprendimiento?.nombreComercial}
            </p>

            <p className="text-gray-600 text-sm">
              Publicado por:{" "}
              {productoSeleccionado.emprendimiento?.emprendedor?.nombre}{" "}
              {productoSeleccionado.emprendimiento?.emprendedor?.apellido}
            </p>

            <button
              onClick={() => {
                navigate(
                  "/" +
                    encodeURIComponent(
                      productoSeleccionado.emprendimiento?.slug
                    )
                );
              }}
              className="mt-4 bg-[#AA4A44] text-white px-4 py-2 rounded-md hover:bg-[#933834] transition-colors"
            >
              Ir al Emprendimiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
