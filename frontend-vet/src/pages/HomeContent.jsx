import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fondoblanco from "../assets/fondoblanco.jpg";
import storeAuth from "../context/storeAuth";

const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  /* =========================
     CARGA DE DATOS
  ========================== */
  useEffect(() => {
    fetch("https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos")
      .then(res => res.json())
      .then(data => setEmprendimientos(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch("https://backend-production-bd1d.up.railway.app/api/productos/todos")
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : data?.productos || []));
  }, []);

  /* =========================
     HELPERS
  ========================== */
  const getEmprendedorId = (obj) => {
    if (!obj) return null;
    if (typeof obj === "string") return obj;
    if (obj._id) return obj._id;
    if (obj.id?._id) return obj.id._id;
    return null;
  };

  const irAlChat = (emprendedorId) => {
    if (!usuarioId) {
      navigate("/login?rol=cliente");
      return;
    }
    if (!emprendedorId) {
      console.warn("ID de emprendedor no válido");
      return;
    }
    navigate(`/dashboard/chat?user=${encodeURIComponent(emprendedorId)}`);
  };

  /* =========================
     CONTACTAR
  ========================== */
  const contactarProducto = (e, producto) => {
    e.stopPropagation();
    const emp = producto?.emprendimiento?.emprendedor;
    irAlChat(getEmprendedorId(emp));
  };

  const contactarEmprendimiento = (e, emp) => {
    e.stopPropagation();
    irAlChat(getEmprendedorId(emp?.emprendedor));
  };

  /* =========================
     RENDER
  ========================== */
  return (
    <>
      {/* PRODUCTOS */}
      <section className="py-10 px-6 bg-white">
        <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
          Productos Destacados
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {productos.map(prod => (
            <article
              key={prod._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer"
              onClick={() => setProductoSeleccionado(prod)}
            >
              <img src={prod.imagen} alt={prod.nombre} className="h-40 w-full object-cover rounded" />
              <h3 className="mt-2 font-bold text-[#AA4A44]">{prod.nombre}</h3>
              <p className="text-sm">{prod.descripcion}</p>

              <button
                onClick={(e) => contactarProducto(e, prod)}
                className="mt-3 w-full bg-[#AA4A44] text-white py-2 rounded"
              >
                Contactar
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* EMPRENDIMIENTOS */}
      <section
        className="py-16 px-6"
        style={{
          backgroundImage: `url(${fondoblanco})`,
          backgroundSize: "cover"
        }}
      >
        <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
          Emprendimientos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {emprendimientos.map(emp => (
            <div
              key={emp._id}
              className="bg-white p-4 rounded-lg shadow cursor-pointer"
              onClick={() => setEmprendimientoSeleccionado(emp)}
            >
              <img src={emp.logo} alt={emp.nombreComercial} className="h-40 w-full object-cover rounded" />
              <h3 className="mt-2 font-bold text-[#AA4A44]">
                {emp.nombreComercial}
              </h3>

              <button
                onClick={(e) => contactarEmprendimiento(e, emp)}
                className="mt-3 w-full border border-[#AA4A44] text-[#AA4A44] py-2 rounded"
              >
                Contactar
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeContent;
