import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import storeAuth from "../context/storeAuth";

const EmprendimientoPublico = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = storeAuth(); // 🔥 Detectar si viene desde Dashboard

  const [loading, setLoading] = useState(true);
  const [emprendimiento, setEmprendimiento] = useState(null);

  // 🔥 Función para manejar todos los botones "Volver"
  const handleVolver = () => {
    if (token) {
      navigate("/dashboard/inicio"); // Si está logueado vuelve al dashboard
    } else {
      navigate("/"); // Si NO está logueado vuelve al Home
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/emprendimientos/slug/${slug}`;
        const { data } = await axios.get(url);
        setEmprendimiento(data);
      } catch (error) {
        console.log("Error cargando emprendimiento:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Cargando...</p>
      </div>
    );
  }

  if (!emprendimiento) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Emprendimiento no encontrado</h1>
        <button
          onClick={handleVolver}
          className="px-4 py-2 rounded-md border border-[#E0C7B6]"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* -------------------- NAV SUPERIOR -------------------- */}
      <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-[#1E1E2F]">
          {emprendimiento.nombre}
        </h1>

        <button
          onClick={handleVolver}
          className="text-sm font-medium text-[#1E1E2F] border border-transparent hover:border-[#E0C7B6] px-3 py-1 rounded-md"
        >
          ← Volver
        </button>
      </nav>

      {/* -------------------- CONTENIDO -------------------- */}
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold text-[#1E1E2F] mb-6">
          {emprendimiento.nombre}
        </h2>

        {/* Imagen */}
        {emprendimiento.imagen && (
          <img
            src={emprendimiento.imagen}
            alt={emprendimiento.nombre}
            className="w-full h-72 object-cover rounded-lg shadow-md mb-6"
          />
        )}

        {/* Descripción */}
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {emprendimiento.descripcion}
        </p>

        {/* Información */}
        <div className="space-y-4">
          <p>
            <strong>Categoría:</strong> {emprendimiento.categoria}
          </p>
          <p>
            <strong>Ubicación:</strong> {emprendimiento.ubicacion}
          </p>
          <p>
            <strong>WhatsApp:</strong>{" "}
            <a
              href={`https://wa.me/${emprendimiento.whatsapp}`}
              target="_blank"
              className="text-green-600 underline"
            >
              {emprendimiento.whatsapp}
            </a>
          </p>
          <p>
            <strong>Sitio web:</strong>{" "}
            {emprendimiento.sitioWeb ? (
              <a
                href={emprendimiento.sitioWeb}
                target="_blank"
                className="text-blue-600 underline"
              >
                Abrir sitio web
              </a>
            ) : (
              "No registrado"
            )}
          </p>
        </div>

        {/* Botón Final */}
        <div className="mt-10">
          <button
            onClick={handleVolver}
            className="px-6 py-2 bg-[#E0C7B6] text-[#1E1E2F] font-semibold rounded-lg shadow hover:bg-[#d2b6a6]"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmprendimientoPublico;
