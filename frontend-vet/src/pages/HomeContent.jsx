import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

const BACKEND_URL = 'https://backend-production-bd1d.up.railway.app';
const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300?text=Sin+imagen';

/* ======================================================
   ICONO CORAZÓN
====================================================== */
const IconHeartSvg = ({ filled = false, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21s-6.716-4.33-9.428-7.043C.86 12.245.86 9.487 2.572 7.774c1.713-1.713 4.47-1.713 6.183 0L12 10.02l3.245-3.246c1.713-1.713 4.47-1.713 6.183 0 1.713 1.713 1.713 4.47 0 6.183C18.716 16.67 12 21 12 21z"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth="1.5"
    />
  </svg>
);

/* ======================================================
   BOTÓN ME ENCANTA – UX/UI PROFESIONAL
====================================================== */
const HeartButton = ({
  filled = false,
  onClick,
  label = 'Me encanta',
  ariaLabel,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      aria-pressed={filled}
      aria-label={ariaLabel || label}
      className={`
        flex items-center justify-center gap-2
        h-11 px-3
        rounded-lg
        border
        transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${
          filled
            ? 'bg-[#AA4A44] text-white border-[#AA4A44] hover:brightness-110'
            : 'bg-white text-[#AA4A44] border-[#E5CFCB] hover:bg-[#F8EFED]'
        }
        ${className}
      `}
    >
      <span className="flex items-center justify-center w-8 h-8">
        <IconHeartSvg filled={filled} />
      </span>

      {/* Texto solo desde sm */}
      <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">
        {label}
      </span>
    </button>
  );
};

/* ======================================================
   HOME CONTENT
====================================================== */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId } = storeAuth();

  const [productos, setProductos] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  const getImageUrl = (img) =>
    !img ? DEFAULT_IMAGE : img.startsWith('http') ? img : `${BACKEND_URL}${img}`;

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/productos/todos`)
      .then((r) => r.json())
      .then((d) => setProductos(Array.isArray(d) ? d : d.productos || []));
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/emprendimientos/publicos`)
      .then((r) => r.json())
      .then((d) => setEmprendimientos(Array.isArray(d) ? d : []));
  }, []);

  /* ================= FAVORITOS ================= */
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
    });
  };

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <>
      {/* ================= PRODUCTOS ================= */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-10">
            Productos Destacados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productos.map((p) => {
              const fav = favorites.has(`producto:${p._id}`);

              return (
                <article
                  key={p._id}
                  className="flex flex-col bg-white border rounded-xl shadow-sm hover:shadow-lg transition"
                >
                  <img
                    src={getImageUrl(p.imagen)}
                    alt={p.nombre}
                    className="h-44 w-full object-cover rounded-t-xl"
                  />

                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-semibold text-[#AA4A44]">
                      {p.nombre}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {p.descripcion}
                    </p>

                    <p className="mt-2 font-bold text-green-600">
                      ${p.precio}
                    </p>

                    {/* ACCIONES */}
                    <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                      <HeartButton
                        filled={fav}
                        onClick={(e) =>
                          toggleFavorite(e, 'producto', p._id)
                        }
                        className="w-full"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          usuarioId
                            ? navigate(
                                `/dashboard/chat?productoId=${p._id}`
                              )
                            : navigate('/login?rol=cliente');
                        }}
                        className="h-11 w-full rounded-lg bg-[#AA4A44] text-white text-sm font-medium hover:brightness-110 transition"
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

      {/* ================= EMPRENDIMIENTOS ================= */}
      <section
        className="py-16 px-4"
        style={{
          backgroundImage: `url(${fondoblanco})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#AA4A44] text-center mb-10">
            Explora Emprendimientos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {emprendimientos.map((e) => {
              const fav = favorites.has(`emprendimiento:${e._id}`);

              return (
                <div
                  key={e._id}
                  className="flex flex-col bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer"
                >
                  <img
                    src={getImageUrl(e.logo)}
                    alt={e.nombreComercial}
                    className="h-40 w-full object-cover rounded-t-xl"
                  />

                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-semibold text-[#AA4A44]">
                      {e.nombreComercial}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {e.descripcion}
                    </p>

                    <div className="mt-auto pt-4 grid grid-cols-3 gap-2">
                      <button
                        className="col-span-2 h-11 rounded-lg bg-[#AA4A44] text-white text-sm hover:brightness-110"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          window.open(
                            `https://frontend-production-480a.up.railway.app/${e.slug}`,
                            '_blank'
                          );
                        }}
                      >
                        Ver sitio
                      </button>

                      <HeartButton
                        filled={fav}
                        onClick={(ev) =>
                          toggleFavorite(ev, 'emprendimiento', e._id)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeContent;
