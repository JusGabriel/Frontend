import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

const BACKEND_URL = 'https://backend-production-bd1d.up.railway.app';
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300?text=Sin+imagen';

/* ---------------- IconHeart ---------------- */
const IconHeartSvg = ({ filled = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21s-6.716-4.33-9.428-7.043C.86 12.245.86 9.487 2.572 7.774c1.713-1.713 4.47-1.713 6.183 0L12 10.02l3.245-3.246c1.713-1.713 4.47-1.713 6.183 0 1.713 1.713 1.713 4.47 0 6.183C18.716 16.67 12 21 12 21z"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.5"
    />
  </svg>
);

/* ---------------- HeartButton ----------------
   - box-border para que borders no cambien tamaño
   - h-11 y flex-1 para igualar altura y width cuando se usan en flex row
   - texto oculto en xs y visible desde sm
------------------------------------------------*/
const HeartButton = ({ filled = false, onClick, label = 'Me encanta', ariaLabel, className = '' }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    try {
      onClick?.(e, !filled);
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
      // box-border para que border no aumente tamaño; h-11 para altura fija; flex-1 para ocupar espacio en fila
      className={`box-border flex items-center justify-center gap-2 h-11 flex-1 px-3 rounded-lg border transition-all text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] 
        ${filled ? 'bg-[#AA4A44] text-white border-[#AA4A44] hover:brightness-110' : 'bg-white text-[#AA4A44] border-[#E5CFCB] hover:bg-[#F8EFED]'}
        ${className}`}
    >
      <span className="flex items-center justify-center w-8 h-8 flex-none">
        <IconHeartSvg filled={filled} />
      </span>

      {/* texto solo desde sm: evita expandir el botón en pantallas muy pequeñas */}
      <span className="hidden sm:inline font-medium leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

/* ---------------- HomeContent ---------------- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [productos, setProductos] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  const getImageUrl = (img) => (!img ? DEFAULT_IMAGE : img.startsWith('http') ? img : `${BACKEND_URL}${img}`);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/productos/todos`)
      .then((r) => r.json())
      .then((d) => setProductos(Array.isArray(d) ? d : d.productos || []))
      .catch((err) => console.error('Error fetch productos:', err));
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/emprendimientos/publicos`)
      .then((r) => r.json())
      .then((d) => setEmprendimientos(Array.isArray(d) ? d : []))
      .catch((err) => console.error('Error fetch emprendimientos:', err));
  }, []);

  const toggleFavorite = (e, tipo, id) => {
    e.stopPropagation();
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }
    setFavorites((prev) => {
      const next = new Set(prev);
      const key = `${tipo}:${id}`;
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

    fetch(`${BACKEND_URL}/api/favoritos/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tipo, id }),
    }).catch((err) => console.error('Error togglear favorito:', err));
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    const nombre = e.nombre ?? e.nombres ?? '';
    const apellido = e.apellido ?? e.apellidos ?? '';
    return `${nombre} ${apellido}`.trim() || '—';
  };

  return (
    <>
      {/* PRODUCTOS */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-10">
            Productos Destacados
          </h2>

          {/* auto-rows-fr hace que cada celda tenga la misma altura en la fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 auto-rows-fr">
            {productos.map((p) => {
              const fav = favorites.has(`producto:${p._id}`);

              return (
                // h-full + flex-col permite que mt-auto empuje las acciones al final y que todas las cards igualen altura
                <article
                  key={p._id}
                  className="h-full flex flex-col bg-white border border-[#E0C7B6] rounded-xl p-0 shadow-sm hover:shadow-lg transition overflow-hidden"
                  role="button"
                  tabIndex={0}
                  onClick={() => setProductoSeleccionado(p)}
                >
                  <div className="w-full">
                    <img
                      src={getImageUrl(p.imagen)}
                      alt={p.nombre}
                      className="w-full h-44 object-cover"
                      onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold text-[#AA4A44]">{p.nombre}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.descripcion}</p>

                    <div className="mt-2">
                      <p className="text-lg font-bold text-[#28a745]">${p.precio}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">Stock: {p.stock ?? '—'}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Emprendimiento:</strong> {p.emprendimiento?.nombreComercial ?? '—'}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {p.emprendimiento?.emprendedor ? `${p.emprendimiento.emprendedor.nombre ?? ''} ${p.emprendimiento.emprendedor.apellido ?? ''}`.trim() || '—' : '—'}</p>
                    </div>

                    {/* ACCIONES: uso de flex para que ambos botones tengan la misma altura y ancho proporcional */}
                    <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
                      <HeartButton
                        filled={fav}
                        onClick={(e) => toggleFavorite(e, 'producto', p._1 || p._id)}
                        label="Me encanta"
                        ariaLabel={`Agregar ${p.nombre} a favoritos`}
                        className="flex-1"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          usuarioId ? navigate(`/dashboard/chat?productoId=${p._id}`) : navigate('/login?rol=cliente');
                        }}
                        className="flex-1 h-11 rounded-lg bg-[#AA4A44] text-white text-sm font-medium hover:brightness-110 transition"
                        aria-label={`Contactar ${p.nombre}`}
                      >
                        Contactar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* EMPRENDIMIENTOS */}
      <section
        className="py-16 px-4"
        style={{
          backgroundImage: `url(${fondoblanco})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-10">Explora Emprendimientos</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 auto-rows-fr">
            {emprendimientos.map((e) => {
              const fav = favorites.has(`emprendimiento:${e._id}`);

              return (
                <div
                  key={e._id}
                  className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-[#E0C7B6] overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => {
                    // navegar a la web pública (ajusta si tu URL es externa)
                    window.open(`/${encodeURIComponent(e.slug || e.nombreComercial)}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className="w-full">
                    <img
                      src={getImageUrl(e.logo)}
                      alt={e.nombreComercial}
                      className="w-full h-40 object-cover"
                      onError={(ev) => { ev.currentTarget.src = DEFAULT_IMAGE; }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-semibold text-[#AA4A44]">{e.nombreComercial}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{e.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-2">{e.ubicacion?.ciudad ?? ''} {e.ubicacion?.direccion ? `- ${e.ubicacion.direccion}` : ''}</p>

                    <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          // abrir detalle o sitio
                          window.open(`/${encodeURIComponent(e.slug || e.nombreComercial)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="flex-1 h-11 rounded-lg bg-[#AA4A44] text-white text-sm hover:brightness-110 transition"
                        aria-label={`Ver sitio ${e.nombreComercial}`}
                      >
                        Ver sitio
                      </button>

                      <HeartButton
                        filled={fav}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          toggleFavorite(ev, 'emprendimiento', e._id);
                        }}
                        label="Me encanta"
                        ariaLabel={`Agregar ${e.nombreComercial} a favoritos`}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODALES (simple) */}
      {productoSeleccionado && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setProductoSeleccionado(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-600" onClick={() => setProductoSeleccionado(null)} aria-label="Cerrar">✕</button>
            <img src={getImageUrl(productoSeleccionado.imagen)} alt={productoSeleccionado.nombre} className="w-full h-48 object-cover rounded-md mb-4" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
            <h2 className="text-xl font-bold text-[#AA4A44]">{productoSeleccionado.nombre}</h2>
            <p className="text-gray-600 mt-2">{productoSeleccionado.descripcion}</p>
          </div>
        </div>
      )}

      {emprendimientoSeleccionado && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setEmprendimientoSeleccionado(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-600" onClick={() => setEmprendimientoSeleccionado(null)} aria-label="Cerrar">✕</button>
            <img src={getImageUrl(emprendimientoSeleccionado.logo)} alt={emprendimientoSeleccionado.nombreComercial} className="w-full h-48 object-cover rounded-md mb-4" onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }} />
            <h2 className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>
            <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default HomeContent;
