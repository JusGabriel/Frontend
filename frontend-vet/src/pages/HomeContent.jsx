import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

/* -------------------- Icon / HeartButton -------------------- */
const IconHeartSvg = ({ filled = false, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
 * HeartButton - botón "Me encanta"
 * - móvil: icono centrado (ancho completo si se pasa w-full)
 * - sm+: muestra texto y ancho auto (NO forzamos sm:w-10)
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
  }, [controlledFilled, isControlled]);

  const filled = isControlled ? controlledFilled : localFilled;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isControlled && toggleable) setLocalFilled((s) => !s);
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
      className={`inline-flex items-center justify-center sm:justify-start gap-2 rounded-md shadow-sm transition transform hover:scale-[1.02]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full ${
          filled ? 'bg-[#AA4A44] text-white' : 'bg-white text-[#AA4A44] border border-[#EADBD3]'
        } w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150 flex-none`}
      >
        <IconHeartSvg filled={filled} size={16} />
      </span>

      {/* Texto solo en sm+ para ahorrar espacio en móvil */}
      <span className={`text-xs sm:text-sm font-medium leading-none ${filled ? 'text-white' : 'text-[#AA4A44]'} hidden sm:inline`}>
        {label}
      </span>
    </button>
  );
};

/* -------------------- HomeContent -------------------- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [section] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  const API_BASE = 'https://backend-production-bd1d.up.railway.app';

  // helpers
  const generarSlug = (texto) =>
    texto
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

  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || generarSlug(emp?.nombreComercial) || emp?._id;
    return `https://frontend-production-480a.up.railway.app/${slug}`;
  };

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

  // fetch data
  useEffect(() => {
    fetch(`${API_BASE}/api/emprendimientos/publicos`)
      .then((res) => res.json())
      .then((data) => setEmprendimientos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error emprendimientos:', err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/productos/todos`)
      .then((res) => res.json())
      .then((data) => {
        const productosArray = Array.isArray(data) ? data : Array.isArray(data?.productos) ? data.productos : [];
        setProductos(productosArray);
      })
      .catch((err) => console.error('Error productos:', err));
  }, []);

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    return `${e.nombre ?? e.nombres ?? ''} ${e.apellido ?? e.apellidos ?? ''}`.trim() || '—';
  };

  // navigation / actions
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const empr = producto.emprendimiento ?? {};
    const emprendedorId = empr?.emprendedor?._id ?? empr?.emprendedorId;
    if (!emprendedorId) return console.warn('Producto sin emprendedor:', producto);

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
    const emprendedorId = emp?.emprendedor?._1 ?? emp?.emprendedor?._id ?? emp?.emprendedorId;
    if (!emprendedorId) return console.warn('Emprendimiento sin emprendedor:', emp);

    if (usuarioId) {
      navigate(`/dashboard/chat?user=${emprendedorId}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  // favoritos (optimista)
  const handleFavoriteProducto = (e, producto) => {
    e?.stopPropagation?.();
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }
    try {
      fetch(`${API_BASE}/api/favoritos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'producto', itemId: producto._id }),
      }).catch((err) => console.warn('No se pudo guardar favorito (optimista):', err));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteEmprendimiento = (e, emp) => {
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
      }).catch((err) => console.warn('No se pudo guardar favorito (optimista):', err));
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
                        className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer flex flex-col"
                        onClick={() => setProductoSeleccionado(producto)}
                      >
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-[#AA4A44] truncate">{producto.nombre}</h3>

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
                        </div>

                        {/* ----- BOTONES: móvil apilado, desktop inline ----- */}
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                          {/* Contactar ocupa todo el ancho en móvil y el espacio restante en desktop */}
                          <button
                            onClick={(e) => handleContactarProducto(e, producto)}
                            className="w-full sm:flex-1 min-w-0 h-10 bg-[#AA4A44] text-white rounded-md text-sm font-medium hover:bg-[#933834] transition-colors"
                          >
                            Contactar
                          </button>

                          {/* Heart: en móvil full width (icono centrado), en desktop ancho auto y sin forzar sm:w-10 */}
                          <div className="w-full sm:w-auto">
                            <HeartButton
                              toggleable={!!usuarioId}
                              onClick={(e) => handleFavoriteProducto(e, producto)}
                              ariaLabel={`Agregar ${producto.nombre} a favoritos`}
                              className="h-10 w-full sm:w-auto px-2 sm:px-3"
                            />
                          </div>
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
                      className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col"
                      onClick={() => openPublicSite(emp)}
                    >
                      <img src={emp.logo} alt={emp.nombreComercial} className="w-full h-40 object-cover rounded-lg mb-3" />

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#AA4A44] truncate">{emp.nombreComercial}</h3>

                        <p className="text-sm text-gray-700 font-semibold mt-1">{nombreCompletoEmprendedor(emp)}</p>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>

                        <p className="text-xs text-gray-500 mt-2">
                          {emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}
                        </p>
                      </div>

                      {/* ----- BOTONES EMPRENDIMIENTO: apilado en móvil, inline en desktop ----- */}
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmprendimientoSeleccionado(emp);
                            }}
                            className="h-10 w-full bg-[#AA4A44] text-white rounded-md text-sm font-medium hover:bg-[#933834] transition-colors"
                          >
                            Ver detalles
                          </button>

                          <button
                            onClick={(e) => handleContactarEmprendimiento(e, emp)}
                            className="h-10 w-full border border-[#AA4A44] text-[#AA4A44] rounded-md text-sm font-medium hover:bg-[#F9F1ED]"
                          >
                            Contactar
                          </button>
                        </div>

                        <div className="w-full sm:w-auto">
                          <HeartButton
                            toggleable={!!usuarioId}
                            onClick={(e) => handleFavoriteEmprendimiento(e, emp)}
                            ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                            className="h-10 w-full sm:w-auto px-2 sm:px-3"
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
                  aria-label="Cerrar"
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

                <p className="text-sm text-gray-600 mt-2">
                  <strong>Emprendimiento:</strong> {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  <strong>Emprendedor:</strong>{' '}
                  {productoSeleccionado.emprendimiento?.emprendedor
                    ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''}`.trim()
                    : '—'}
                </p>

                {/* Modal botones: móvil apilado, desktop inline */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const empr = productoSeleccionado.emprendimiento ?? {};
                      const id = empr?.emprendedor?._id ?? empr?.emprendedorId;
                      if (!id) return;
                      if (usuarioId) {
                        navigate(
                          `/dashboard/chat?user=${id}&productoId=${productoSeleccionado._id}&productoNombre=${encodeURIComponent(
                            productoSeleccionado.nombre
                          )}`
                        );
                      } else {
                        navigate('/login?rol=cliente');
                      }
                    }}
                    className="w-full sm:flex-1 h-10 bg-[#AA4A44] text-white rounded-md text-sm font-medium hover:bg-[#933834] transition-colors"
                  >
                    Contactar
                  </button>

                  <div className="w-full sm:w-auto">
                    <HeartButton
                      toggleable={!!usuarioId}
                      onClick={(e) => handleFavoriteProducto(e, productoSeleccionado)}
                      ariaLabel={`Agregar ${productoSeleccionado.nombre} a favoritos`}
                      className="h-10 w-full sm:w-auto px-2 sm:px-3"
                    />
                  </div>
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
                  aria-label="Cerrar"
                >
                  ✕
                </button>

                <img
                  src={emprendimientoSeleccionado.logo}
                  alt={emprendimientoSeleccionado.nombreComercial}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />

                <h2 className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>

                <p className="text-gray-800 font-bold text-sm mt-1">
                  Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}
                </p>

                <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>

                <p className="text-sm text-gray-500 mt-2">
                  {emprendimientoSeleccionado.ubicacion?.ciudad} – {emprendimientoSeleccionado.ubicacion?.direccion}
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {emprendimientoSeleccionado.contacto?.sitioWeb && (
                      <a
                        href={emprendimientoSeleccionado.contacto.sitioWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007bff] hover:underline text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Sitio web
                      </a>
                    )}

                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPublicSite(emprendimientoSeleccionado, { closeModal: true });
                        }}
                        className="h-10 w-full bg-[#AA4A44] text-white rounded-md text-sm font-medium hover:bg-[#933834]"
                      >
                        Ir al sitio
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const emprendedorId = emprendimientoSeleccionado?.emprendedor?._id ?? emprendimientoSeleccionado?.emprendedorId;
                          if (!emprendedorId) return;
                          if (usuarioId) {
                            navigate(`/dashboard/chat?user=${emprendedorId}`);
                          } else {
                            navigate('/login?rol=cliente');
                          }
                        }}
                        className="h-10 w-full border border-[#AA4A44] text-[#AA4A44] rounded-md text-sm font-medium hover:bg-[#F9F1ED]"
                      >
                        Contactar
                      </button>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    <HeartButton
                      toggleable={!!usuarioId}
                      onClick={(e) => handleFavoriteEmprendimiento(e, emprendimientoSeleccionado)}
                      ariaLabel={`Agregar ${emprendimientoSeleccionado.nombreComercial} a favoritos`}
                      className="h-10 w-full sm:w-auto px-2 sm:px-3"
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
