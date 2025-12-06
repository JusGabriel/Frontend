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

  // nuevos estados para modales (copiados del Home para igualar comportamiento)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/emprendimientos/publicos')
      .then(res => res.json())
      .then(data => setEmprendimientos(Array.isArray(data) ? data : []))
      .catch(error => console.error('Error al cargar emprendimientos:', error));
  }, []);

  useEffect(() => {
    fetch('https://backend-production-bd1d.up.railway.app/api/productos/todos')
      .then(res => res.json())
      .then(data => {
        // normalizar respuesta: puede venir array o { productos: [] }
        const productosArray = Array.isArray(data) ? data : (Array.isArray(data?.productos) ? data.productos : []);
        setProductos(productosArray);
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }, []);

  // Navegar a detalle emprendimiento (tu original)
  const handleVerMasEmprendimiento = (id) => {
    navigate(`/dashboard/detalle-emprendimiento/${id}`);
  };

  // helpers (copiados/ajustados del Home para que todo coincida)
  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || emp?.nombreComercial || emp?._id;
    return `/emprendimiento/${encodeURIComponent(slug)}`;
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    const nombre = e.nombre ?? e.nombres ?? '';
    const apellido = e.apellido ?? e.apellidos ?? '';
    return `${nombre} ${apellido}`.trim() || '—';
  };

  // comportamiento del botón Contactar (mismo que Home: si está auth -> chat, si no -> login)
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const empr = producto.emprendimiento ?? {};
    if (usuarioId) {
      navigate(`/dashboard/chat?emprendimientoId=${empr._id}&productoId=${producto._id}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  const handleContactarEmprendimiento = (e, emp) => {
    e.stopPropagation();
    if (usuarioId) {
      navigate(`/dashboard/chat?emprendimientoId=${emp._id}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  return (
    <>
      {section === 'inicio' && (
        <>
          {/* ---------------- PRODUCTOS (adaptado al estilo del Home) ---------------- */}
          <section className="py-10 px-6 bg-white text-gray-800">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Productos Destacados</h2>

              {productos.length === 0 ? (
                <p className="text-center mt-6 text-gray-600">Cargando productos...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                  {productos.map((producto) => {
                    const empr = producto.emprendimiento ?? {};
                    const dueño = empr?.emprendedor ?? null;

                    return (
                      <article
                        key={producto._id}
                        className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setProductoSeleccionado(producto)}
                        role="button"
                        tabIndex={0}
                      >
                        <img src={producto.imagen} alt={producto.nombre} className="w-full h-48 object-cover rounded-lg mb-4" />

                        <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>

                        <p className="mt-3 text-lg font-bold text-[#28a745]">${producto.precio}</p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">Stock: {producto.stock ?? '—'}</p>

                        <p className="text-sm text-gray-600 mt-1"><strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}</p>

                        <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`.trim() || '—' : '—'}</p>

                        <div className="mt-3">
                          <button
                            onClick={(e) => handleContactarProducto(e, producto)}
                            className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                            aria-label={`Contactar ${producto.nombre}`}
                          >
                            Contactar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Línea decorativa */}
          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

          {/* ---------------- EMPRENDIMIENTOS (adaptado al estilo del Home: vertical grid) ---------------- */}
          <section
            className="py-16 px-4 text-gray-800"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Explora Emprendimientos</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                {emprendimientos.length === 0 ? (
                  <p className="text-center w-full text-gray-600">Cargando emprendimientos...</p>
                ) : (
                  emprendimientos.map((emp) => (
                    <div
                      key={emp._id}
                      className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => navigate(buildPublicUrl(emp))}
                    >
                      <img src={emp.logo} alt={emp.nombreComercial} className="w-full h-40 object-cover rounded-lg mb-3" />

                      <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>

                      <p className="text-sm text-gray-700 font-semibold mt-1">{nombreCompletoEmprendedor(emp)}</p>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>

                      <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmprendimientoSeleccionado(emp);
                          }}
                          className="mt-3 bg-[#AA4A44] text-white px-3 py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                        >
                          Ver detalles
                        </button>

                        <button
                          onClick={(e) => handleContactarEmprendimiento(e, emp)}
                          className="mt-3 bg-white border border-[#AA4A44] text-[#AA4A44] px-3 py-2 rounded-md text-sm hover:bg-white/90 transition-colors"
                        >
                          Contactar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ---------------- MODAL PRODUCTO (igual que en Home) ---------------- */}
          {productoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
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

                <h2 className="text-xl font-bold text-[#AA4A44]">{productoSeleccionado.nombre}</h2>

                <p className="text-gray-600 mt-2">{productoSeleccionado.descripcion}</p>

                <p className="font-bold text-[#28a745] mt-3 text-lg">${productoSeleccionado.precio}</p>

                <p className="font-semibold text-gray-800 mt-2">Stock disponible: {productoSeleccionado.stock ?? '—'}</p>

                <p className="text-sm text-gray-600 mt-2"><strong>Emprendimiento:</strong> {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}</p>

                <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {productoSeleccionado.emprendimiento?.emprendedor ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''}`.trim() || '—' : '—'}</p>

                <div className="mt-4">
                  <button
                    onClick={() => {
                      // si está autenticado, llevar al chat; si no, al login (igual comportamiento)
                      if (usuarioId) {
                        const empr = productoSeleccionado.emprendimiento ?? {};
                        navigate(`/dashboard/chat?emprendimientoId=${empr._id}&productoId=${productoSeleccionado._id}`);
                      } else {
                        navigate('/login?rol=cliente');
                      }
                    }}
                    className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
                  >
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- MODAL EMPRENDIMIENTO (igual que en Home) ---------------- */}
          {emprendimientoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
              onClick={() => setEmprendimientoSeleccionado(null)}
            >
              <div
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setEmprendimientoSeleccionado(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>

                <img
                  src={emprendimientoSeleccionado.logo}
                  alt={emprendimientoSeleccionado.nombreComercial}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />

                <h2 className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>

                <p className="text-gray-800 font-bold text-sm mt-1">Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}</p>

                <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>

                <p className="text-sm text-gray-500 mt-2">{emprendimientoSeleccionado.ubicacion?.ciudad} – {emprendimientoSeleccionado.ubicacion?.direccion}</p>

                <div className="flex gap-3 mt-4 flex-wrap text-sm">
                  {emprendimientoSeleccionado.contacto?.sitioWeb && (
                    <a href={emprendimientoSeleccionado.contacto.sitioWeb} target="_blank" rel="noreferrer" className="text-[#007bff] hover:underline">Sitio web</a>
                  )}

                  {emprendimientoSeleccionado.contacto?.facebook && (
                    <a href={emprendimientoSeleccionado.contacto.facebook} target="_blank" rel="noreferrer" className="text-[#3b5998] hover:underline">Facebook</a>
                  )}

                  {emprendimientoSeleccionado.contacto?.instagram && (
                    <a href={emprendimientoSeleccionado.contacto.instagram} target="_blank" rel="noreferrer" className="text-[#C13584] hover:underline">Instagram</a>
                  )}

                  <button
                    onClick={() => {
                      setEmprendimientoSeleccionado(null);
                      navigate(buildPublicUrl(emprendimientoSeleccionado));
                    }}
                    className="bg-[#AA4A44] text-white px-3 py-1 rounded-md text-sm hover:bg-[#933834] transition-colors"
                  >
                    Ir al sitio
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HomeContent;
