import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Fondo opcional (puedes cambiarlo)
import fondoblanco from "../assets/fondoblanco.jpg";

export const HomeContent = () => {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const navigate = useNavigate();

  // --- Construye la URL pública con slug ---
  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || emp?.nombreComercial;
    return `/${encodeURIComponent(slug)}`;
  };

  // --- Nombre completo del emprendedor ---
  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return "—";
    const nombre = e.nombre ?? e.nombres ?? "";
    const apellido = e.apellido ?? e.apellidos ?? "";
    return `${nombre} ${apellido}`.trim() || "—";
  };

  // --- Cargar emprendimientos ---
  useEffect(() => {
    const fetchEmprendimientos = async () => {
      try {
        const res = await fetch(
          "https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos"
        );
        const data = await res.json();
        setEmprendimientos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar emprendimientos:", error);
      }
    };

    fetchEmprendimientos();
  }, []);

  return (
    <section
      className="py-16 px-6 text-gray-800"
      style={{
        backgroundImage: `url(${fondoblanco})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
          Explora Emprendimientos
        </h2>

        {emprendimientos.length === 0 ? (
          <p className="text-gray-600">Cargando emprendimientos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {emprendimientos.map((emp) => (
              <div
                key={emp._id}
                className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                onClick={() => navigate(buildPublicUrl(emp))}
              >
                <img
                  src={emp.logo}
                  alt={emp.nombreComercial}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />

                <h3 className="text-lg font-semibold text-[#AA4A44]">
                  {emp.nombreComercial}
                </h3>

                <p className="text-sm text-gray-700 mt-1 font-semibold">
                  {nombreCompletoEmprendedor(emp)}
                </p>

                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {emp.descripcion ?? "Sin descripción disponible."}
                </p>

                <button
                  className="w-full mt-3 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(buildPublicUrl(emp));
                  }}
                >
                  Ver sitio web
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
