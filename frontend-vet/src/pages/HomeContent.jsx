import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import fondoblanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';

/* -------------------- Config UX: Mostrar más (client-side) -------------------- */
const PRODUCTS_PAGE_SIZE = 8; // cantidad a mostrar por bloque en Productos
const EMPS_PAGE_SIZE = 8;     // cantidad a mostrar por bloque en Emprendimientos

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
 */
const HeartButton = ({
  filled: controlledFilled,
  onClick = () => {},
  label = 'Me encanta',
  ariaLabel,
  className = '',
  size = 'md',
  fullWidth = true,
  showLabelOnMobile = true,
  variant = 'outline',
}) => {
  const isControlled = typeof controlledFilled === 'boolean';
  const [localFilled, setLocalFilled] = useState(Boolean(controlledFilled));
  useEffect(() => {
    if (isControlled) setLocalFilled(Boolean(controlledFilled));
  }, [controlledFilled, isControlled]);

  const filled = isControlled ? controlledFilled : localFilled;

  const handleClick = (e) => {
    e.stopPropagation();
    // If uncontrolled, toggle locally
    if (!isControlled) setLocalFilled((s) => !s);
    onClick(e, !filled);
  };

  const heightClass = size === 'sm' ? 'h-11' : size === 'lg' ? 'h-14' : 'h-12';
  const circleSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-10 h-10' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const circleStyles =
    filled || variant === 'solid'
      ? 'bg-[#AA4A44] text-white'
      : 'bg-white text-[#AA4A44] border border-[#EADBD3]';
  const textColor = filled ? 'text-white' : 'text-[#AA4A44]';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={filled}
      aria-label={ariaLabel || label}
      title={label}
      className={`inline-flex items-center ${fullWidth ? 'w-full' : 'w-auto'} ${heightClass}
        justify-start gap-2 rounded-lg shadow-sm transition
        hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]
        ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full ${circleStyles} ${circleSize} transition-colors duration-150 flex-none`}
      >
        <IconHeartSvg filled={filled} size={iconSize} />
      </span>
      <span
        className={`text-xs sm:text-sm font-medium leading-none ${textColor} ${
          showLabelOnMobile ? 'inline' : 'hidden sm:inline'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

/* -------------------- HomeContent -------------------- */
const HomeContent = () => {
  const navigate = useNavigate();
  const { id: usuarioId, token } = storeAuth() || {};
  const [section] = useState('inicio');
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  // favoritos
  const [favoritesSet, setFavoritesSet] = useState(new Set()); // set de itemId
  const [favoriteDocsByItem, setFavoriteDocsByItem] = useState({}); // map itemId -> favorito doc

  const API_BASE = 'https://backend-production-bd1d.up.railway.app';
  const FRONTEND_BASE = window.location.origin;

  // ====== Estados de UX/Paginación (client-side) ======
  const [prodVisibleCount, setProdVisibleCount] = useState(PRODUCTS_PAGE_SIZE);
  const [empVisibleCount, setEmpVisibleCount] = useState(EMPS_PAGE_SIZE);

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
    return `${FRONTEND_BASE}/${slug}`;
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

  // Fetch data: emprendimientos y productos (sin auth)
  useEffect(() => {
    fetch(`${API_BASE}/api/emprendimientos/publicos`)
      .then((res) => res.json())
      .then((data) => {
        setEmprendimientos(Array.isArray(data) ? data : []);
        setEmpVisibleCount(EMPS_PAGE_SIZE); // reinicia visible ante nueva carga
      })
      .catch((err) => console.error('Error emprendimientos:', err));
  }, []);

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
        setProdVisibleCount(PRODUCTS_PAGE_SIZE); // reinicia visible ante nueva carga
      })
      .catch((err) => console.error('Error productos:', err));
  }, []);

  // Cargar favoritos del usuario (si está autenticado)
  const fetchMyFavorites = useCallback(async () => {
    if (!token) {
      setFavoritesSet(new Set());
      setFavoriteDocsByItem({});
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/favoritos/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn('No se pudo obtener favoritos:', await res.text());
        return;
      }
      const data = await res.json();
      const setIds = new Set();
      const mapDocs = {};
      if (Array.isArray(data)) {
        data.forEach((f) => {
          if (f?.item) {
            setIds.add(String(f.item));
            mapDocs[String(f.item)] = f;
          }
        });
      }
      setFavoritesSet(setIds);
      setFavoriteDocsByItem(mapDocs);
    } catch (err) {
      console.error('Error fetchMyFavorites:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchMyFavorites();
  }, [fetchMyFavorites]);

  // Construir meta mínimo para producto/emprendimiento
  const buildMetaFromProduct = (producto) => ({
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: producto.imagen,
    slug: producto.slug || generarSlug(producto.nombre),
    emprendimiento: {
      _id: producto.emprendimiento?._id ?? producto.emprendimientoId ?? null,
      nombreComercial: producto.emprendimiento?.nombreComercial ?? null,
    },
  });

  const buildMetaFromEmprendimiento = (emp) => ({
    nombre: emp.nombreComercial,
    descripcion: emp.descripcion,
    imagen: emp.logo,
    slug: emp.slug || generarSlug(emp.nombreComercial),
  });

  // toggle favorito (unifica producto y emprendimiento)
  const toggleFavorite = async ({ itemId, itemModel, meta, optimistic = true }) => {
    if (!token) {
      navigate('/login?rol=cliente');
      return;
    }

    const idStr = String(itemId);

    // optimista: aplicar cambio localmente
    const wasFavorite = favoritesSet.has(idStr);
    const newSet = new Set(favoritesSet);
    const newDocs = { ...favoriteDocsByItem };
    if (wasFavorite) {
      newSet.delete(idStr);
      delete newDocs[idStr];
    } else {
      newSet.add(idStr);
      // placeholder doc until server returns
      newDocs[idStr] = { item: itemId, itemModel, meta, activo: true };
    }
    if (optimistic) {
      setFavoritesSet(newSet);
      setFavoriteDocsByItem(newDocs);
    }

    try {
      const res = await fetch(`${API_BASE}/api/favoritos/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, itemModel, meta }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al alternar favorito');
      }

      const result = await res.json();
      // result.action: 'created'|'removed'|'reactivated' and favorito
      if (result?.favorito) {
        const f = result.favorito;
        const map = { ...favoriteDocsByItem };
        if (result.action === 'removed') {
          // remove
          const s = new Set(favoritesSet);
          s.delete(String(itemId));
          setFavoritesSet(s);
          delete map[String(itemId)];
          setFavoriteDocsByItem(map);
        } else {
          // created or reactivated
          const s = new Set(favoritesSet);
          s.add(String(itemId));
          setFavoritesSet(s);
          map[String(itemId)] = f;
          setFavoriteDocsByItem(map);
        }
      } else {
        // en caso de respuesta inesperada, recargar la lista desde servidor
        fetchMyFavorites();
      }
    } catch (err) {
      console.error('Error toggleFavorite:', err);
      // revertir optimista
      fetchMyFavorites();
    }
  };

  // wrappers específicos
  const handleFavoriteProducto = (e, producto) => {
    e?.stopPropagation?.();
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }
    toggleFavorite({
      itemId: producto._id,
      itemModel: 'Producto',
      meta: buildMetaFromProduct(producto),
    });
  };

  const handleFavoriteEmprendimiento = (e, emp) => {
    e?.stopPropagation?.();
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }
    toggleFavorite({
      itemId: emp._id,
      itemModel: 'Emprendimiento',
      meta: buildMetaFromEmprendimiento(emp),
    });
  };

  // navegación / acciones (igual que antes)
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
    const emprendedorId = emp?.emprendedor?._id ?? emp?.emprendedorId;
    if (!emprendedorId) return console.warn('Emprendimiento sin emprendedor:', emp);

    if (usuarioId) {
      navigate(`/dashboard/chat?user=${emprendedorId}`);
    } else {
      navigate('/login?rol=cliente');
    }
  };

  // ====== Derivados visibles (client-side) ======
  const productosVisibles = productos.slice(0, prodVisibleCount);
  const emprVisibles = emprendimientos.slice(0, empVisibleCount);

  // Contadores “del 1 al X de Y”
  const prodStart = 1;
  const prodEnd = Math.min(prodVisibleCount, productos.length);
  const empStart = 1;
  const empEnd = Math.min(empVisibleCount, emprendimientos.length);

  return (
    <>
      {section === 'inicio' && (
        <>
          {/* PRODUCTOS DESTACADOS */}
          <section className="py-10 px-6 bg-white text-gray-800" aria-labelledby="productos-title">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 id="productos-title" className="text-3xl font-bold text-[#AA4A44] text-center mb-2">
                Productos Destacados
              </h2>

              {/* Contador UX */}
              <p className="text-sm text-gray-600 mb-6">
                Mostrando del <strong>{prodStart}</strong> al <strong>{prodEnd}</strong> de{' '}
                <strong>{productos.length}</strong> productos
              </p>

              {productos.length === 0 ? (
                <p className="text-center mt-6 text-gray-600">Cargando productos...</p>
              ) : (
                <>
                  <div
                    id="grid-productos"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
                    aria-live="polite"
                  >
                    {productosVisibles.map((producto) => {
                      const empr = producto.emprendimiento ?? {};
                      const dueño = empr?.emprendedor ?? null;
                      const isFav = favoritesSet.has(String(producto._id));

                      return (
                        <article
                          key={producto._id}
                          className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer flex flex-col h-full overflow-hidden"
                          onClick={() => setProductoSeleccionado(producto)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setProductoSeleccionado(producto);
                            }
                          }}
                        >
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-48 object-cover rounded-lg mb-4 flex-shrink-0"
                            loading="lazy"
                          />

                          <div className="flex-1 min-w-0 mb-4">
                            <h3 className="font-semibold text-lg text-[#AA4A44] truncate mb-2">
                              {producto.nombre}
                            </h3>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {producto.descripcion}
                            </p>

                            <p className="text-lg font-bold text-[#28a745] mb-2">${producto.precio}</p>

                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Stock: {producto.stock ?? '—'}
                            </p>

                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}
                            </p>

                            <p className="text-sm text-gray-600">
                              <strong>Emprendedor:</strong>{' '}
                              {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`.trim() : '—'}
                            </p>
                          </div>

                          {/* BOTONES PRODUCTOS: columna, dentro de la card */}
                          <div className="mt-auto grid grid-cols-1 gap-2">
                            <button
                              onClick={(e) => handleContactarProducto(e, producto)}
                              className="w-full h-11 bg-[#AA4A44] text-white rounded-lg text-sm font-semibold hover:bg-[#933834] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Contactar
                            </button>
                            <HeartButton
                              filled={isFav}
                              onClick={(e) => handleFavoriteProducto(e, producto)}
                              ariaLabel={`Agregar ${producto.nombre} a favoritos`}
                              className="px-3 shadow-sm hover:shadow-md"
                              size="sm"
                              fullWidth
                              showLabelOnMobile
                            />
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Botón "Mostrar más" (progresivo) */}
                  <div className="w-full mt-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setProdVisibleCount((c) => Math.min(c + PRODUCTS_PAGE_SIZE, productos.length))
                      }
                      disabled={prodVisibleCount >= productos.length}
                      className={`px-5 py-2 rounded-md text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] ${
                        prodVisibleCount >= productos.length
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                          : 'bg-white text-[#AA4A44] border-[#AA4A44] hover:bg-white/90'
                      }`}
                      aria-controls="grid-productos"
                      aria-label="Mostrar más productos"
                    >
                      {prodVisibleCount >= productos.length ? 'No hay más productos' : 'Mostrar más productos'}
                    </button>
                  </div>
                </>
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
            aria-labelledby="empr-title"
          >
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <h2 id="empr-title" className="text-3xl font-bold text-[#AA4A44] text-center mb-2">
                Explora Emprendimientos
              </h2>

              {/* Contador UX */}
              <p className="text-sm text-gray-600 mb-6">
                Mostrando del <strong>{empStart}</strong> al <strong>{empEnd}</strong> de{' '}
                <strong>{emprendimientos.length}</strong> emprendimientos
              </p>

              <div
                id="grid-empr"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
                aria-live="polite"
              >
                {emprendimientos.length === 0 ? (
                  <p className="text-center w-full text-gray-600 col-span-full">Cargando emprendimientos...</p>
                ) : (
                  emprVisibles.map((emp) => {
                    const isFav = favoritesSet.has(String(emp._id));
                    return (
                      <div
                        key={emp._id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E0C7B6]/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden hover:-translate-y-1"
                        onClick={() => openPublicSite(emp)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openPublicSite(emp);
                          }
                        }}
                      >
                        <img
                          src={emp.logo}
                          alt={emp.nombreComercial}
                          className="w-full h-40 object-cover rounded-xl mb-4 flex-shrink-0"
                          loading="lazy"
                        />

                        {/* Contenido principal */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[#AA4A44] truncate mb-2">
                            {emp.nombreComercial}
                          </h3>

                          <p className="text-base font-semibold text-gray-800 mb-2">
                            {/* Nombre emprendedor */}
                            {emp.emprendedor?.nombre
                              ? `${emp.emprendedor?.nombre} ${emp.emprendedor?.apellido ?? ''}`.trim()
                              : '—'}
                          </p>

                          <p className="text-sm text-gray-700 line-clamp-3 mb-3">{emp.descripcion}</p>

                          <p className="text-xs font-medium text-gray-600 bg-gray-100/50 px-2 py-1 rounded-full inline-block">
                            {emp.ubicacion?.ciudad}, {emp.ubicacion?.direccion}
                          </p>
                        </div>

                        {/* BOTONES EMPRENDIMIENTOS: columna 100%, SIEMPRE dentro de la card */}
                        <div className="mt-6 grid grid-cols-1 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmprendimientoSeleccionado(emp);
                            }}
                            className="h-11 w-full bg-[#AA4A44] text-white rounded-lg text-sm font-semibold hover:bg-[#933834] transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Detalles
                          </button>

                          <button
                            onClick={(e) => handleContactarEmprendimiento(e, emp)}
                            className="h-11 w-full bg-white border-2 border-[#AA4A44] text-[#AA4A44] rounded-lg text-sm font-semibold hover:bg-[#AA4A44] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            Contactar
                          </button>

                          <HeartButton
                            filled={isFav}
                            onClick={(e) => handleFavoriteEmprendimiento(e, emp)}
                            ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                            className="px-3 shadow-sm hover:shadow-md"
                            size="sm"
                            fullWidth
                            showLabelOnMobile
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Botón "Mostrar más" (progresivo) */}
              <div className="w-full mt-8 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setEmpVisibleCount((c) => Math.min(c + EMPS_PAGE_SIZE, emprendimientos.length))
                  }
                  disabled={empVisibleCount >= emprendimientos.length}
                  className={`px-5 py-2 rounded-md text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44] ${
                    empVisibleCount >= emprendimientos.length
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                      : 'bg-white text-[#AA4A44] border-[#AA4A44] hover:bg-white/90'
                  }`}
                  aria-controls="grid-empr"
                  aria-label="Mostrar más emprendimientos"
                >
                  {empVisibleCount >= emprendimientos.length
                    ? 'No hay más emprendimientos'
                    : 'Mostrar más emprendimientos'}
                </button>
              </div>
            </div>
          </section>

          {/* MODALES (sin cambios funcionales) */}
          {productoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
              onClick={() => setProductoSeleccionado(null)}
            >
              <div
                className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>

                <div className="text-center mb-6">
                  <img
                    src={productoSeleccionado.imagen}
                    alt={productoSeleccionado.nombre}
                    className="w-48 h-48 object-cover rounded-2xl mx-auto mb-6 shadow-lg"
                    loading="lazy"
                  />
                  <h2 className="text-2xl font-bold text-[#AA4A44] mb-2">{productoSeleccionado.nombre}</h2>
                  <p className="text-3xl font-black text-[#28a745] mb-4">${productoSeleccionado.precio}</p>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-gray-700 text-lg leading-relaxed">{productoSeleccionado.descripcion}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Stock</p>
                      <p className="text-2xl font-bold text-gray-900">{productoSeleccionado.stock ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Emprendimiento</p>
                      <p className="font-semibold text-[#AA4A44]">
                        {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm">
                    <strong className="text-gray-800">Emprendedor:</strong>{' '}
                    {productoSeleccionado.emprendimiento?.emprendedor
                      ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${
                          productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''
                        }`.trim()
                      : '—'}
                  </p>
                </div>

                {/* BOTONES MODAL PRODUCTO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="h-14 bg-[#AA4A44] text-white rounded-xl text-lg font-bold hover:bg-[#933834] transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    💬 Contactar
                  </button>

                  <HeartButton
                    filled={favoritesSet.has(String(productoSeleccionado._id))}
                    onClick={(e) => handleFavoriteProducto(e, productoSeleccionado)}
                    ariaLabel={`Agregar ${productoSeleccionado.nombre} a favoritos`}
                    className="h-14 px-6 shadow-lg hover:shadow-xl"
                    size="lg"
                    fullWidth
                    showLabelOnMobile
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          )}

          {emprendimientoSeleccionado && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
              onClick={() => setEmprendimientoSeleccionado(null)}
            >
              <div
                className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setEmprendimientoSeleccionado(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                  aria-label="Cerrar"
                >
                  ✕
                </button>

                <div className="text-center mb-6">
                  <img
                    src={emprendimientoSeleccionado.logo}
                    alt={emprendimientoSeleccionado.nombreComercial}
                    className="w-32 h-32 object-cover rounded-2xl mx-auto mb-6 shadow-lg border-4 border-white"
                    loading="lazy"
                  />
                  <h2 className="text-2xl font-bold text-[#AA4A44] mb-2">
                    {emprendimientoSeleccionado.nombreComercial}
                  </h2>
                  <p className="text-lg font-semibold text-gray-800">{/* emprendedor */}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-gray-700 text-lg leading-relaxed">{emprendimientoSeleccionado.descripcion}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Ubicación</p>
                      <p className="font-semibold text-gray-900">{emprendimientoSeleccionado.ubicacion?.ciudad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Dirección</p>
                      <p className="text-sm text-gray-700">{emprendimientoSeleccionado.ubicacion?.direccion}</p>
                    </div>
                  </div>

                  {emprendimientoSeleccionado.contacto?.sitioWeb && (
                    <a
                      href={emprendimientoSeleccionado.contacto.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🌐 Visitar Sitio Web
                    </a>
                  )}
                </div>

                {/* BOTONES MODAL EMPRENDIMIENTO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPublicSite(emprendimientoSeleccionado, { closeModal: true });
                    }}
                    className="h-14 bg-gradient-to-r from-[#AA4A44] to-[#933834] text-white rounded-xl text-lg font-bold hover:from-[#933834] hover:to-[#7A3830] transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    🚀 Ir al Sitio
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const emprendedorId =
                        emprendimientoSeleccionado?.emprendedor?._id ??
                        emprendimientoSeleccionado?.emprendedorId;
                      if (!emprendedorId) return;
                      if (usuarioId) {
                        navigate(`/dashboard/chat?user=${emprendedorId}`);
                      } else {
                        navigate('/login?rol=cliente');
                      }
                    }}
                    className="h-14 border-2 border-[#AA4A44] text-[#AA4A44] rounded-xl text-lg font-bold hover:bg-[#AA4A44] hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    💬 Contactar
                  </button>
                </div>

                <div className="flex justify-center">
                  <HeartButton
                    filled={favoritesSet.has(String(emprendimientoSeleccionado._id))}
                    onClick={(e) => handleFavoriteEmprendimiento(e, emprendimientoSeleccionado)}
                    ariaLabel={`Agregar ${emprendimientoSeleccionado.nombreComercial} a favoritos`}
                    className="h-14 px-8 shadow-lg hover:shadow-xl"
                    size="lg"
                    fullWidth={false}
                    showLabelOnMobile
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
