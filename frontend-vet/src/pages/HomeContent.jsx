import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import Servicios from './pgPrueba/Servicios';
import storeAuth from '../context/storeAuth';

/* -------------------- Icon / HeartButton -------------------- */
const IconHeartSvg = ({ filled = false, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
  >
    <path
      d="M12 21s-6.716-4.33-9.428-7.043C.86 12.245.86 9.487 2.572 7.774c1.713-1.713 4.47-1.713 6.183 0L12 10.02l3.245-3.246c1.713-1.713 4.47-1.713 6.183 0 1.713 1.713 1.713 4.47 0 6.183C18.716 16.67 12 21 12 21z"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : '#AA4A44'}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * HeartButton - botón reutilizable para "Me encanta".
 * Props:
 * - filled: boolean (controlado)
 * - toggleable: boolean (si true y no se pasó `filled`, el botón maneja su propio estado)
 * - onClick: (event, nextState) => void
 * - label, ariaLabel, className
 */
const HeartButton = ({
  filled: controlledFilled,
  onClick = () => {},
  label = 'Me encanta',
  ariaLabel,
  className = '',
  toggleable = false,
}) => {
  const isControlled = typeof controlledFilled === 'boolean';
  const [localFilled, setLocalFilled] = useState(Boolean(controlledFilled));

  useEffect(() => {
    if (isControlled) setLocalFilled(Boolean(controlledFilled));
  }, [controlledFilled]);

  const filled = isControlled ? controlledFilled : localFilled;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isControlled && toggleable) {
      setLocalFilled((s) => !s);
    }
    try {
      onClick(e, !filled);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={filled}
      aria-label={ariaLabel || label}
      title={label}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md shadow-sm transition transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full flex-none ${
          filled ? 'bg-[#AA4A44] text-white' : 'bg-white text-[#AA4A44] border border-[#EADBD3]'
        } w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150`}
      >
        <IconHeartSvg filled={filled} size={16} />
      </span>

      <span
        className={`text-xs sm:text-sm md:text-sm font-medium leading-none ${
          filled ? 'text-white' : 'text-[#AA4A44]'
        } hidden sm:inline`}
      >
        {label}
      </span>
    </button>
  );
};

/* -------------------- HomeContent -------------------- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId, rol: usuarioRol } = storeAuth();

  const [section, setSection] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  const API_BASE = 'https://backend-production-bd1d.up.railway.app';

  // ---------------------------------------
  // SLUG
  // ---------------------------------------
  const generarSlug = (texto) => {
    return texto
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ---------------------------------------
  // URL PÚBLICA
  // ---------------------------------------
  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || generarSlug(emp?.nombreComercial) || emp?._id;
    return `https://frontend-production-480a.up.railway.app/${slug}`;
  };

  // ---------------------------------------
  // ABRIR PÁGINA PÚBLICA
  // ---------------------------------------
  const openPublicSite = (emp, { closeModal = false } = {}) => {
    const url = buildPublicUrl(emp);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (closeModal) {
      setEmprendimientoSeleccionado(null);
      setProductoSeleccionado(null);
    }
  };

  // ---------------------------------------
  // Fetch emprendimientos
  // ---------------------------------------
  useEffect(() => {
    fetch(`${API_BASE}/api/emprendimientos/publicos`)
      .then((res) => res.json())
      .then((data) => setEmprendimientos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error emprendimientos:', err));
  }, []);

  // ---------------------------------------
  // Fetch productos
  // ---------------------------------------
  useEffect(() => {
    fetch(`${API_BASE}/api/productos/todos`)
      .then((res) => res.json())
      .then((data) => {
        const productosArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.productos)
          ? data.productos
          : [];
        setProductos(productosArray);
      })
      .catch((err) => console.error('Error productos:', err));
  }, []);

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    return `${e.nombre ?? e.nombres ?? ''} ${e.apellido ?? e.apellidos ?? ''}`.trim() || '—';
  };

  // ---------------------------------------
  // CONTACTAR: usar ID del EMPRENDEDOR (user param)
  // ---------------------------------------
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const empr = producto.emprendimiento ?? {};
    const emprendedorId = empr?.emprendedor?._id;

    if (!emprendedorId) {
      console.warn('Producto sin emprendedor:', producto);
      return;
    }

    if (usuarioId) {
      navigate(
        `/dashboard/chat?user=${emprendedorId}&productoId=${producto._id}&productoNombre=${encodeURIComponent(
          producto.nombre
        )}`
      );
    } else {
      navigate('/login?rol=cliente');
    }
  };

  const handleContactarEmprendimiento = (e, emp) => {
    e.stopPropagation();
    const emprendedorId = emp?.emprendedor?._id;

    if (!emprendedorId) {
      console.warn('Emprendimiento sin emprendedor:', emp);
      return;
    }

    if (usuarioId) {
      navigate(`/dashboard/chat?user=${emprendedorId}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  // ------------------ Favoritos (UI-only + optimistic backend call) ------------------
  const handleFavoriteProducto = (e, producto, nextState) => {
    // e already stopPropagation in HeartButton, but keep safe
    e?.stopPropagation?.();

    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }

    // Optimistic UI handled by HeartButton (toggleable)
    // Real implementation: llamada al backend para crear/eliminar favorito
    // Aquí lanzamos petición 'fire-and-forget' (ajusta según tu API)
    try {
      fetch(`${API_BASE}/api/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'producto', itemId: producto._id }),
        // si usas auth, agrega Authorization header con token
      }).catch((err) => {
        console.warn('No se pudo guardar favorito (optimista):', err);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteEmprendimiento = (e, emp, nextState) => {
    e?.stopPropagation?.();

    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }

    try {
      fetch(`${API_BASE}/api/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'emprendimiento', itemId: emp._id }),
      }).catch((err) => {
        console.warn('No se pudo guardar favorito (optimista):', err);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {section === 'inicio' && (
        <>
          {/* PRODUCTOS DESTACADOS */}
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
                      >
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />

                        <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>

                        <p className="mt-3 text-lg font-bold text-[#28a745]">${producto.precio}</p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">Stock: {producto.stock ?? '—'}</p>

                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Emprendedor:</strong>{' '}
                          {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`.trim() : '—'}
                        </p>

                        {/* Botones: Heart + Contactar (responsive, no rompe diseño) */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="w-full">
                            <HeartButton
                              toggleable={!!usuarioId}
                              onClick={(e, next) => handleFavoriteProducto(e, producto, next)}
                              label="Me encanta"
                              ariaLabel={`Agregar ${producto.nombre} a favoritos`}
                              className="w-full justify-center"
                            />
                          </div>

                          <button
                            onClick={(e) => handleContactarProducto(e, producto)}
                            className="w-full mt-0 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors"
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

          {/* EMPRENDIMIENTOS */}
          <section
            className="py-16 px-4 text-gray-800"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Explora Emprendimientos</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
                {emprendimientos.length === 0 ? (
                  <p className="text-center w-full text-gray-600">Cargando emprendimientos...</p>
                ) : (
                  emprendimientos.map((emp) => (
                    <div
                      key={emp._id}
                      className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => openPublicSite(emp)}
                    >
                      <img src={emp.logo} alt={emp.nombreComercial} className="w-full h-40 object-cover rounded-lg mb-3" />

                      <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>

                      <p className="text-sm text-gray-700 font-semibold mt-1">{nombreCompletoEmprendedor(emp)}</p>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>

                      <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>

                      {/* Ajuste: 3 columnas en sm para mantener proporción y no romper diseño */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmprendimientoSeleccionado(emp);
                          }}
                          className="bg-[#AA4A44] text-white px-3 py-2 rounded-md text-sm hover:bg-[#933834]"
                        >
                          Ver detalles
                        </button>

                        <button
                          onClick={(e) => handleContactarEmprendimiento(e, emp)}
                          className="bg-white border border-[#AA4A44] text-[#AA4A44] px-3 py-2 rounded-md text-sm hover:bg-white/90"
                        >
                          Contactar
                        </button>

                        <div className="w-full">
                          <HeartButton
                            toggleable={!!usuarioId}
                            onClick={(e, next) => handleFavoriteEmprendimiento(e, emp, next)}
                            label="Me encanta"
                            ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                            className="w-full justify-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* MODAL PRODUCTO */}
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

                <p className="font-semibold text-gray-800 mt-2">
                  Stock disponible: {productoSeleccionado.stock ?? '—'}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  <strong>Emprendimiento:</strong> {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Emprendedor:</strong>{' '}
                  {productoSeleccionado.emprendimiento?.emprendedor
                    ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''}`
                    : '—'}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <HeartButton
                    toggleable={!!usuarioId}
                    onClick={(e, next) => handleFavoriteProducto(e, productoSeleccionado, next)}
                    label="Agregar a favoritos"
                    ariaLabel={`Agregar ${productoSeleccionado.nombre} a favoritos`}
                    className="w-full justify-center"
                  />

                  <button
                    onClick={() => {
                      if (usuarioId) {
                        const empr = productoSeleccionado.emprendimiento ?? {};
                        const emprendedorId = empr?.emprendedor?._id;
                        if (!emprendedorId) return;
                        navigate(
                          `/dashboard/chat?user=${emprendedorId}&productoId=${productoSeleccionado._id}&productoNombre=${encodeURIComponent(
                            productoSeleccionado.nombre
                          )}`
                        );
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

          {/* MODAL EMPRENDIMIENTO */}
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

                <h2 className="text-xl font-bold text-[#AA4A44]">
                  {emprendimientoSeleccionado.nombreComercial}
                </h2>

                <p className="text-gray-800 font-bold text-sm mt-1">
                  Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}
                </p>

                <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>

                <p className="text-sm text-gray-500 mt-2">
                  {emprendimientoSeleccionado.ubicacion?.ciudad} –{' '}
                  {emprendimientoSeleccionado.ubicacion?.direccion}
                </p>

                <div className="flex gap-3 mt-4 flex-wrap text-sm">
                  {emprendimientoSeleccionado.contacto?.sitioWeb && (
                    <a
                      href={emprendimientoSeleccionado.contacto.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007bff] hover:underline"
                    >
                      Sitio web
                    </a>
                  )}

                  {emprendimientoSeleccionado.contacto?.facebook && (
                    <a
                      href={emprendimientoSeleccionado.contacto.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b5998] hover:underline"
                    >
                      Facebook
                    </a>
                  )}

                  {emprendimientoSeleccionado.contacto?.instagram && (
                    <a
                      href={emprendimientoSeleccionado.contacto.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C13584] hover:underline"
                    >
                      Instagram
                    </a>
                  )}

                  <button
                    onClick={() => {
                      openPublicSite(emprendimientoSeleccionado, { closeModal: true });
                    }}
                    className="bg-[#AA4A44] text-white px-3 py-1 rounded-md text-sm hover:bg-[#933834]"
                  >
                    Ir al sitio
                  </button>

                  <button
                    onClick={() => {
                      // Contactar emprendedor desde modal de emprendimiento
                      const emprendedorId = emprendimientoSeleccionado?.emprendedor?._id;
                      if (!emprendedorId) return;
                      if (usuarioId) {
                        navigate(`/dashboard/chat?user=${emprendedorId}`);
                      } else {
                        navigate('/login?rol=cliente');
                      }
                    }}
                    className="bg-white border border-[#AA4A44] text-[#AA4A44] px-3 py-1 rounded-md text-sm hover:bg-white/90"
                  >
                    Contactar
                  </button>

                  <div className="ml-2">
                    <HeartButton
                      toggleable={!!usuarioId}
                      onClick={(e, next) => handleFavoriteEmprendimiento(e, emprendimientoSeleccionado, next)}
                      label="Me encanta"
                      ariaLabel={`Agregar ${emprendimientoSeleccionado.nombreComercial} a favoritos`}
                    />
                  </div>
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
