import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- navegación
import fondoblanco from '../assets/fondoblanco.jpg';
import Servicios from './pgPrueba/Servicios';
import storeAuth from '../context/storeAuth';  // <-- importamos el auth para obtener id y rol

const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId, rol: usuarioRol } = storeAuth();

  const [section, setSection] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos')
      .then(res => res.json())
      .then(data => setEmprendimientos(data))
      .catch(error => console.error('Error al cargar emprendimientos:', error));
  }, []);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/productos/todos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(error => console.error('Error al cargar productos:', error));
  }, []);

  // Navegar a detalle emprendimiento
  const handleVerMasEmprendimiento = (id) => {
    navigate(`/dashboard/detalle-emprendimiento/${id}`);
  };

  return (
    <>
      {section === 'inicio' && (
        <>
          {/* PRODUCTOS DESTACADOS */}
          <section className="py-4 px-6 bg-white text-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8 relative inline-block">
                Productos Destacados
                <span className="block mx-auto mt-2 h-1 w-24 bg-[#AA4A44] rounded"></span>
              </h2>

              {productos.length === 0 ? (
                <p className="text-center mt-6">Cargando productos...</p>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
                  {productos.map((producto) => {
                    return (
                      <div
                        key={producto._id}
                        className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all flex flex-col"
                      >
                        <div className="w-1 bg-[#AA4A44] rounded-l-xl mr-4"></div>

                        <div className="flex-1">
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>
                          <p className="text-sm text-gray-600">{producto.descripcion}</p>
                          <p className="text-[#28a745] font-bold mt-2">${producto.precio}</p>

                          <div className="mt-4">
                            <button
                              className="bg-[#28a745] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1e7e34] transition-colors w-full"
                              onClick={() => navigate(`/dashboard/pagar/${producto._id}`)}
                            >
                              Pagar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Línea decorativa */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* EMPRENDIMIENTOS */}
          <section
            className="py-16 px-4 text-gray-800 relative overflow-hidden"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(170,74,68,0.05) 0, rgba(170,74,68,0.05) 1px, transparent 1px, transparent 20px)',
                zIndex: 0,
              }}
            />

            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8 relative inline-block">
                Explora Emprendimientos
                <span className="block mx-auto mt-2 h-1 w-24 bg-[#AA4A44] rounded"></span>
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-4 w-full max-w-[calc(100vw-48px)] md:max-w-full">
                {emprendimientos.length === 0 ? (
                  <p className="text-center w-full">Cargando emprendimientos...</p>
                ) : (
                  emprendimientos.map((emp) => (
                    <div
                      key={emp._id}
                      className="min-w-[280px] bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleVerMasEmprendimiento(emp._id)}
                    >
                      <img
                        src={emp.logo}
                        alt={emp.nombreComercial}
                        className="w-full h-36 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>
                      <p className="text-sm text-gray-600">{emp.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>
                      <div className="flex gap-3 mt-3 flex-wrap text-sm">
                        {emp.contacto?.sitioWeb && (
                          <a href={emp.contacto.sitioWeb} target="_blank" rel="noreferrer" className="text-[#007bff] hover:underline">Sitio web</a>
                        )}
                        {emp.contacto?.facebook && (
                          <a href={emp.contacto.facebook} target="_blank" rel="noreferrer" className="text-[#3b5998] hover:underline">Facebook</a>
                        )}
                        {emp.contacto?.instagram && (
                          <a href={emp.contacto.instagram} target="_blank" rel="noreferrer" className="text-[#C13584] hover:underline">Instagram</a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default HomeContent;
