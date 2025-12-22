import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

// URL base del backend (ajústala si cambia)
const BACKEND_URL = 'https://backend-production-bd1d.up.railway.app';

// Imagen por defecto
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300?text=Sin+imagen';

/* ---------------------------
   Iconos / HeartButton
   --------------------------- */

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
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * HeartButton
 * - Prop `filled` (boolean) controla el estado visual.
 * - `onClick` recibirá (event, nextState)
 * - Responsive: oculta texto en pantallas muy pequeñas
 */
const HeartButton = ({ filled = false, onClick = () => {}, label = 'Me encanta', ariaLabel, className = '' }) => {
  const handleClick = (e) => {
    e.stopPropagation();
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
      <span className={`inline-flex items-center justify-center rounded-full flex-none ${filled ? 'bg-[#AA4A44] text-white' : 'bg-white text-[#AA4A44] border border-[#EADBD3]'} w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150`}>
        <IconHeartSvg filled={filled} size={16} />
      </span>

      <span className={`text-xs sm:text-sm md:text-sm font-medium ${filled ? 'text-[#333] sm:text-white' : 'text-[#AA4A44]'} hidden sm:inline`}>
        {label}
      </span>
    </button>
  );
};

/* ---------------------------
   HomeContent
   --------------------------- */

const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [section] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  // Mantener favoritos en memoria (clave: `${tipo}:${id}`)
  const [favorites, setFavorites] = useState(() => new Set());

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------
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
    window.open(buildPublicUrl(emp), '_blank', 'noopener,noreferrer');
    if (closeModal) {
      setEmprendimientoSeleccionado(null);
      setProductoSeleccionado(null);
    }
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    return `${e.nombre ?? e.nombres ?? ''} ${e.apellido ?? e.apellidos ?? ''}`.trim() || '—';
  };

  const getImageUrl = (img) => {
    if (!img) return DEFAULT_IMAGE;
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img.startsWith('/') ? img : `/${img}`}`;
  };

  // -------------------------------------------------
  // Fetch data
  // -------------------------------------------------
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/emprendimientos/publicos`)
      .then((res) => res.json())
      .then((data) => setEmprendimientos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error emprendimientos:', err));
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/productos/todos`)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : Array.isArray(data?.productos) ? data.productos : [];
        setProductos(arr);
      })
      .catch((err) => console.error('Error productos:', err));
  }, []);

  // Opcional: cargar favoritos del usuario si está logueado
  useEffect(() => {
    if (!usuarioId) {
      setFavorites(new Set());
      return;
    }

    // Intentamos obtener favoritos desde backend (ajusta endpoint si hace falta).
    fetch(`${BACKEND_URL}/api/favoritos/mios`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // esperamos un array con objetos { tipo: 'producto'|'emprendimiento', id: '...' }
        if (!Array.isArray(data)) return;
        const set = new Set();
        data.forEach((f) => {
          if (f?.tipo && f?.id) set.add(`${f.tipo}:${f.id}`);
        });
        setFavorites(set);
      })
      .catch((err) => {
        // No es crítico; sólo logueamos
        console.info('No se pudieron cargar favoritos (puede no existir endpoint):', err);
      });
  }, [usuarioId]);

  // -------------------------------------------------
  // Favoritos: toggle (optimista)
  // -------------------------------------------------
  const handleToggleFavorite = (e, tipo, id) => {
    e.stopPropagation();
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }

    const key = `${tipo}:${id}`;
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

    // Llamada al backend para persistir (ajusta ruta si tu API es diferente)
    fetch(`${BACKEND_URL}/api/favoritos/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tipo, id }),
    })
      .then((res) => {
        if (!res.ok) {
          // opcional: revertir el cambio si es necesario
          console.error('Error al togglear favorito:', res.statusText || res.status);
        }
        return res.json().catch(() => null);
      })
      .catch((err) => {
        console.error('Error red al togglear favorito:', err);
      });
  };

  // -------------------------------------------------
  // Contactar
  // -------------------------------------------------
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const emprendedorId = producto?.emprendimiento?.emprendedor?._id;
    if (!emprendedorId) return;

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
    if (!emprendedorId) return;

    if (usuarioId) {
      navigate(`/dashboard/chat?user=${emprendedorId}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <>
      {section === 'inicio' && (
        <>
          {/* ================= PRODUCTOS ================= */}
          <section className="py-10 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Productos Destacados</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {productos.map((producto) => {
                  const empr = producto.emprendimiento ?? {};
                  const dueño = empr?.emprendedor;
                  const isFavorited = favorites.has(`producto:${producto._id}`);

                  return (
                    <article
                      key={producto._id}
                      className="border rounded-xl p-4 shadow hover:shadow-lg cursor-pointer"
                      onClick={() => setProductoSeleccionado(producto)}
                    >
                      <img src={getImageUrl(producto.imagen)} alt={producto.nombre} className="w-full h-48 object-cover rounded-lg mb-3" />

                      <h3 className="font-semibold text-[#AA4A44]">{producto.nombre}</h3>

                      <p className="text-sm text-gray-600 line-clamp-2">{producto.descripcion}</p>

                      <p className="mt-2 font-bold text-green-600">${producto.precio}</p>

                      <p className="text-sm mt-1">
                        <strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}
                      </p>

                      <p className="text-sm">
                        <strong>Emprendedor:</strong>{' '}
                        {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}` : '—'}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="w-full">
                          <HeartButton
                            filled={isFavorited}
                            onClick={(e) => handleToggleFavorite(e, 'producto', producto._id)}
                            label="Me encanta"
                            ariaLabel={`Agregar ${producto.nombre} a favoritos`}
                            className="w-full justify-center"
                          />
                        </div>

                        <button
                          onClick={(e) => handleContactarProducto(e, producto)}
                          className="w-full mt-0 bg-[#AA4A44] text-white py-2 rounded-md"
                        >
                          Contactar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= EMPRENDIMIENTOS ================= */}
          <section
            className="py-16 px-4"
            style={{
              backgroundImage: `url(${fondoblanco})`,
              backgroundSize: 'cover',
            }}
          >
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">Explora Emprendimientos</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {emprendimientos.map((emp) => {
                  const isFavorited = favorites.has(`emprendimiento:${emp._id}`);
                  return (
                    <div
                      key={emp._id}
                      className="bg-white p-5 rounded-xl shadow cursor-pointer"
                      onClick={() => openPublicSite(emp)}
                    >
                      <img src={getImageUrl(emp.logo)} alt={emp.nombreComercial} className="w-full h-40 object-cover rounded-lg mb-3" />

                      <h3 className="font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>

                      <p className="text-sm font-semibold">{nombreCompletoEmprendedor(emp)}</p>

                      <p className="text-sm text-gray-600 line-clamp-2">{emp.descripcion}</p>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmprendimientoSeleccionado(emp);
                          }}
                          className="bg-[#AA4A44] text-white px-3 py-2 rounded-md text-sm"
                        >
                          Ver detalles
                        </button>

                        <div className="w-full">
                          <HeartButton
                            filled={isFavorited}
                            onClick={(e) => handleToggleFavorite(e, 'emprendimiento', emp._id)}
                            label="Me encanta"
                            ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                            className="w-full justify-center"
                          />
                        </div>

                        <button
                          onClick={(e) => handleContactarEmprendimiento(e, emp)}
                          className="border border-[#AA4A44] text-[#AA4A44] px-3 py-2 rounded-md text-sm"
                        >
                          Contactar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= MODALES ================= */}
          {productoSeleccionado && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setProductoSeleccionado(null)}>
              <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <img src={getImageUrl(productoSeleccionado.imagen)} alt={productoSeleccionado.nombre} className="w-full h-48 object-cover rounded mb-4" />

                <h2 className="text-xl font-bold text-[#AA4A44]">{productoSeleccionado.nombre}</h2>

                <p className="mt-2">{productoSeleccionado.descripcion}</p>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <HeartButton
                    filled={favorites.has(`producto:${productoSeleccionado._id}`)}
                    onClick={(e) => handleToggleFavorite(e, 'producto', productoSeleccionado._id)}
                    label="Agregar a favoritos"
                    ariaLabel={`Agregar ${productoSeleccionado.nombre} a favoritos`}
                    className="w-full justify-center"
                  />

                  <button
                    className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded"
                    onClick={(e) => handleContactarProducto(e, productoSeleccionado)}
                  >
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          )}

          {emprendimientoSeleccionado && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEmprendimientoSeleccionado(null)}>
              <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <img src={getImageUrl(emprendimientoSeleccionado.logo)} alt={emprendimientoSeleccionado.nombreComercial} className="w-full h-48 object-cover rounded mb-4" />

                <h2 className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>

                <p className="mt-2">{emprendimientoSeleccionado.descripcion}</p>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    className="w-full mt-0 bg-[#AA4A44] text-white py-2 rounded"
                    onClick={() => openPublicSite(emprendimientoSeleccionado, { closeModal: true })}
                  >
                    Ir al sitio
                  </button>

                  <HeartButton
                    filled={favorites.has(`emprendimiento:${emprendimientoSeleccionado._id}`)}
                    onClick={(e) => handleToggleFavorite(e, 'emprendimiento', emprendimientoSeleccionado._id)}
                    label="Me encanta"
                    ariaLabel={`Agregar ${emprendimientoSeleccionado.nombreComercial} a favoritos`}
                    className="w-full justify-center"
                  />
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
