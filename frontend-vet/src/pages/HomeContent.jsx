import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import storeAuth from '../context/storeAuth';

const BACKEND_URL = 'https://backend-production-bd1d.up.railway.app';
const DEFAULT_IMAGE = 'https://via.placeholder.com/800x600?text=Sin+imagen';

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
   - fixed height, flex-1 para compartir ancho en pies de tarjeta
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
      className={`box-border flex items-center justify-center gap-2 h-11 flex-1 px-3 rounded-md border transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] 
        ${filled ? 'bg-[#AA4A44] text-white border-[#AA4A44] hover:brightness-110' : 'bg-white text-[#AA4A44] border-[#E5CFCB] hover:bg-[#F8EFED]'}
        ${className}`}
    >
      <span className="flex items-center justify-center w-7 h-7 flex-none">
        <IconHeartSvg filled={filled} />
      </span>
      <span className="hidden sm:inline font-medium leading-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

/* ---------------- HomeContent ---------------- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth() || {};

  const [productos, setProductos] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const getImageUrl = (img) => {
    if (!img) return DEFAULT_IMAGE;
    return img.startsWith('http') ? img : `${BACKEND_URL}${img}`;
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/productos/todos`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : d.productos || [];
        setProductos(list);
      })
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

  const onCardClick = (tipo, id) => {
    if (tipo === 'producto') navigate(`/producto/${id}`);
    if (tipo === 'emprendimiento') navigate(`/emprendimiento/${id}`);
  };

  return (
    <div className="space-y-16 py-12 px-4 bg-gray-50">
      {/* PRODUCTOS */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
          Productos Destacados
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productos.map((p) => {
            const favKey = `producto:${p._id}`;
            const isFav = favorites.has(favKey);
            return (
              <article
                key={p._id}
                onClick={() => onCardClick('producto', p._id)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
                role="button"
                tabIndex={0}
              >
                {/* Imagen consistente */}
                <div className="relative w-full h-44 sm:h-40 md:h-44 lg:h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(p.imagen)}
                    alt={p.titulo || 'Producto'}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {p.titulo || 'Sin título'}
                    </h3>
                    {p.precio != null && (
                      <p className="text-sm font-bold text-[#AA4A44] mt-1">
                        ${Number(p.precio).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 flex-1 line-clamp-3">
                    {p.descripcion || '—'}
                  </p>

                  <div className="mt-3 text-xs text-gray-400">
                    <span className="block truncate">{nombreCompletoEmprendedor(p)}</span>
                  </div>

                  {/* Pie: botones que comparten el espacio */}
                  <div className="mt-4 flex gap-3">
                    <HeartButton
                      filled={isFav}
                      onClick={(e) => toggleFavorite(e, 'producto', p._id)}
                      label="Me encanta"
                      ariaLabel="Añadir a favoritos"
                    />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate(`/producto/${p._id}`); }}
                      className="h-11 flex-1 px-3 rounded-md border bg-[#AA4A44] text-white font-medium hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                    >
                      Ver producto
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* EMPRENDIMIENTOS */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-8">
          Emprendimientos
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {emprendimientos.map((e) => {
            const favKey = `emprendimiento:${e._id}`;
            const isFav = favorites.has(favKey);
            return (
              <article
                key={e._id}
                onClick={() => onCardClick('emprendimiento', e._id)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
                role="button"
                tabIndex={0}
              >
                <div className="relative w-full h-44 sm:h-40 md:h-44 lg:h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(e.imagenPortada || e.imagen)}
                    alt={e.nombre || 'Emprendimiento'}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {e.nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{e.rubro || e.categoria || ''}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 flex-1 line-clamp-3">
                    {e.descripcionCorta || e.descripcion || '—'}
                  </p>

                  <div className="mt-3 text-xs text-gray-400">
                    <span className="block truncate">{nombreCompletoEmprendedor(e)}</span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <HeartButton
                      filled={isFav}
                      onClick={(ev) => toggleFavorite(ev, 'emprendimiento', e._id)}
                      label="Favorito"
                      ariaLabel="Añadir emprendimiento a favoritos"
                    />
                    <button
                      type="button"
                      onClick={(ev) => { ev.stopPropagation(); navigate(`/emprendimiento/${e._id}`); }}
                      className="h-11 flex-1 px-3 rounded-md border bg-white text-[#AA4A44] font-medium border-[#E5CFCB] hover:bg-[#F8EFED] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                    >
                      Ver emprendimiento
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomeContent;
