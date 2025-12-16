import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import Servicios from './pgPrueba/Servicios';
import storeAuth from '../context/storeAuth';
import storeProfile from '../context/storeProfile';

const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId, rol: usuarioRol, setChatUser } = storeAuth();
  // si tu storeAuth no expone setChatUser directamente via destructuring, usa:
  // const setChatUser = storeAuth((s) => s.setChatUser);

  const [section, setSection] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

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
        const productosArray = Array.isArray(data) ? data : (Array.isArray(data?.productos) ? data.productos : []);
        setProductos(productosArray);
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }, []);

  const handleVerMasEmprendimiento = (id) => {
    navigate(`/dashboard/detalle-emprendimiento/${id}`);
  };

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

  // Helper robusto para extraer el id del emprendedor (varios posibles formatos)
  const getEmprendedorIdFromProducto = (producto) => {
    const empr = producto?.emprendimiento ?? {};
    const empField = empr?.emprendedor ?? empr; // a veces puede venir solo el objeto emprendedor o el objeto emprendimiento
    // posibles ubicaciones:
    // empField._id, empField.id, empField.id._id, empField (string)
    if (!empField) return null;
    if (typeof empField === 'string') return empField;
    if (empField._id) return empField._id;
    if (empField.id) {
      if (typeof empField.id === 'string') return empField.id;
      if (empField.id._id) return empField.id._id;
    }
    // fallback: usar el id del emprendimiento (no ideal, pero evita null)
    if (empr._id) return empr._id;
    return null;
  };

  const getEmprendedorRoleFromProducto = (producto) => {
    // si en el objeto viene rol explícito, úsalo; sino default a "Emprendedor"
    const empr = producto?.emprendimiento ?? {};
    const empField = empr?.emprendedor ?? empr;
    if (!empField) return 'Emprendedor';
    if (empField.rol) return empField.rol;
    if (empField.role) return empField.role;
    return 'Emprendedor';
  };

  // Nuevo comportamiento: fijar chatUser en storeAuth y navegar con ?user=<id>
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const emprendedorId = getEmprendedorIdFromProducto(producto);
    const emprendedorRol = getEmprendedorRoleFromProducto(producto) || 'Emprendedor';

    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }

    if (!emprendedorId) {
      // si no se puede obtener id, informar (puedes ajustar para mostrar UI)
      console.warn('No se encontró el id del emprendedor para este producto.');
      return;
    }

    // setear en el store el chatUser (para persistencia si lo quieres llevar ahí)
    try {
      setChatUser?.({ id: emprendedorId, rol: emprendedorRol });
    } catch (err) {
      // si tu store usa otra forma de invocar, ajusta arriba.
      console.warn('No fue posible setear chatUser en storeAuth', err);
    }

    // navegar al chat pasando el user (Chat component usa params.get("user"))
    navigate(`/dashboard/chat?user=${encodeURIComponent(emprendedorId)}&productoId=${encodeURIComponent(producto._id)}`);
  };

  const handleContactarEmprendimiento = (e, emp) => {
    e.stopPropagation();
    const emprendedorObj = emp?.emprendedor ?? emp;
    // extraer id
    const emprendedorId =
      (typeof emprendedorObj === 'string' && emprendedorObj) ||
      emprendedorObj?._id ||
      emprendedorObj?.id ||
      emp?._id ||
      null;

    const emprendedorRol = emprendedorObj?.rol || 'Emprendedor';

    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }

    if (!emprendedorId) {
      console.warn('No se encontró el id del emprendedor para este emprendimiento.');
      return;
    }

    try {
      setChatUser?.({ id: emprendedorId, rol: emprendedorRol });
    } catch (err) {
      console.warn('No fue posible setear chatUser en storeAuth', err);
    }

    navigate(`/dashboard/chat?user=${encodeURIComponent(emprendedorId)}&emprendimientoId=${encodeURIComponent(emp._id)}`);
  };

  return (
    <>
      {section === 'inicio' && (
        <>
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

          <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

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
                      if (usuarioId) {
                        const empr = productoSeleccionado.emprendimiento ?? {};
                        const emprendedorId = getEmprendedorIdFromProducto(productoSeleccionado);
                        const emprendedorRol = getEmprendedorRoleFromProducto(productoSeleccionado) || 'Emprendedor';
                        try { setChatUser?.({ id: emprendedorId, rol: emprendedorRol }); } catch (err) {}
                        navigate(`/dashboard/chat?user=${encodeURIComponent(emprendedorId)}&productoId=${encodeURIComponent(productoSeleccionado._id)}`);
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
