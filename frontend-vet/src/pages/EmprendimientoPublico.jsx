
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentsSection from '../components/CommentsSection';
import storeAuth from '../context/storeAuth';

/* -------------------- Config UX: Mostrar más (client-side) -------------------- */
const PRODUCTS_PAGE_SIZE = 8; // cantidad a mostrar por bloque en Productos

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

/* ===================== Página Pública del Emprendimiento ===================== */
const API_BASE = 'https://backend-production-bd1d.up.railway.app';

export default function EmprendimientoPublico() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { id: usuarioId, token } = storeAuth() || {};

  // Emprendimiento
  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [errorEmp, setErrorEmp] = useState(null);

  // Productos del emprendimiento + UX "mostrar más"
  const [productos, setProductos] = useState([]);
  const [loadingProds, setLoadingProds] = useState(false);
  const [errorProds, setErrorProds] = useState(null);
  const [prodVisibleCount, setProdVisibleCount] = useState(PRODUCTS_PAGE_SIZE);

  // Selección para modal
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Comentarios colapsables: desktop abierto, mobile cerrado
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const [commentsOpen, setCommentsOpen] = useState(isDesktop);

  // Favoritos
  const [favoritesSet, setFavoritesSet] = useState(new Set()); // itemId
  const [favoriteDocsByItem, setFavoriteDocsByItem] = useState({}); // itemId -> doc

  // Formateador de precios
  const fmtUSD = useMemo(
    () => new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }),
    []
  );

  /* ===== 1) Cargar emprendimiento por slug ===== */
  useEffect(() => {
    if (!slug) {
      setErrorEmp('No se proporcionó un identificador (slug).');
      setLoadingEmp(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setLoadingEmp(true);
      setErrorEmp(null);
      try {
        const res = await fetch(`${API_BASE}/api/emprendimientos/publico/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error del servidor: ${res.status}`);
        }
        const data = await res.json();
        setEmprendimiento(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando emprendimiento:', err);
          setErrorEmp(err.message || 'Ocurrió un error al cargar el emprendimiento.');
        }
      } finally {
        setLoadingEmp(false);
      }
    };

    run();
    return () => controller.abort();
  }, [slug]);

  /* ===== 2) Cargar productos del emprendimiento ===== */
  // Preferimos lo que venga dentro de `emprendimiento.productos`.
  // Si no hay, usamos fallback: /api/productos/todos y filtramos por emp._id.
  useEffect(() => {
    if (!emprendimiento?._id) return;

    setProdVisibleCount(PRODUCTS_PAGE_SIZE);

    if (Array.isArray(emprendimiento.productos) && emprendimiento.productos.length > 0) {
      setProductos(emprendimiento.productos);
      setErrorProds(null);
      setLoadingProds(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setLoadingProds(true);
      setErrorProds(null);
      try {
        const res = await fetch(`${API_BASE}/api/productos/todos`, { signal: controller.signal });
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.productos) ? raw.productos : [];

        const empId = emprendimiento._id;
        const filtrados = list.filter((p) => {
          const pid = p?.emprendimiento?._id ?? p?.emprendimientoId;
          return String(pid) === String(empId);
        });

        setProductos(filtrados);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error cargando productos del emprendimiento:', err);
          setErrorProds('No se pudieron cargar los productos del emprendimiento.');
        }
      } finally {
        setLoadingProds(false);
      }
    };

    run();
    return () => controller.abort();
  }, [emprendimiento]);

  /* ===== 3) Favoritos del usuario ===== */
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

  /* ===== 4) Lógica de favoritos (idéntica a HomeContent) ===== */
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

  const buildMetaFromProduct = (producto) => ({
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    imagen: producto.imagen,
    slug: producto.slug || generarSlug(producto.nombre),
    emprendimiento: {
      _id: producto.emprendimiento?._id ?? producto.emprendimientoId ?? null,
      nombreComercial: producto.emprendimiento?.nombreComercial ?? emprendimiento?.nombreComercial ?? null,
    },
  });

  const buildMetaFromEmprendimiento = (emp) => ({
    nombre: emp.nombreComercial,
    descripcion: emp.descripcion,
    imagen: emp.logo,
    slug: emp.slug || generarSlug(emp.nombreComercial),
  });

  const toggleFavorite = async ({ itemId, itemModel, meta, optimistic = true }) => {
    if (!token || !usuarioId) {
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
      if (result?.favorito) {
        const f = result.favorito;
        const map = { ...favoriteDocsByItem };
        if (result.action === 'removed') {
          const s = new Set(favoritesSet);
          s.delete(String(itemId));
          setFavoritesSet(s);
          delete map[String(itemId)];
          setFavoriteDocsByItem(map);
        } else {
          const s = new Set(favoritesSet);
          s.add(String(itemId));
          setFavoritesSet(s);
          map[String(itemId)] = f;
          setFavoriteDocsByItem(map);
        }
      } else {
        fetchMyFavorites();
      }
    } catch (err) {
      console.error('Error toggleFavorite:', err);
      fetchMyFavorites();
    }
  };

  // wrappers específicos
  const handleFavoriteProducto = (e, producto) => {
    e?.stopPropagation?.();
    toggleFavorite({
      itemId: producto._id,
      itemModel: 'Producto',
      meta: buildMetaFromProduct(producto),
    });
  };

  const handleFavoriteEmprendimiento = (e, emp) => {
    e?.stopPropagation?.();
    toggleFavorite({
      itemId: emp._id,
      itemModel: 'Emprendimiento',
      meta: buildMetaFromEmprendimiento(emp),
    });
  };

  /* ===== 5) Navegación / acciones ===== */
  const handleContactarProducto = (e, producto) => {
    e.stopPropagation();
    const empr = producto.emprendimiento ?? emprendimiento ?? {};
    const emprendedorId = empr?.emprendedor?._id ?? empr?.emprendedorId;
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

  /* ===== 6) Helpers de render ===== */
  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || 'E';

  const emprendedorNombre =
    emprendimiento?.emprendedor && (emprendimiento.emprendedor.nombre || emprendimiento.emprendedor.nombres)
      ? `${emprendimiento.emprendedor.nombre || emprendimiento.emprendedor.nombres} ${
          emprendimiento.emprendedor.apellido || emprendimiento.emprendedor.apellidos || ''
        }`.trim()
      : '—';

  const estado = (emprendimiento?.estado || '').toString().toLowerCase();
  const estadoStyles =
    estado === 'activo' || estado === 'correcto'
      ? 'bg-[#E6F7ED] text-[#1a7f3a]'
      : 'bg-[#FFF4F0] text-[#AA4A44]';

  const hasTel = Boolean(emprendimiento?.contacto?.telefono);
  const hasMail = Boolean(emprendimiento?.contacto?.email);
  const hasWeb = Boolean(emprendimiento?.contacto?.sitioWeb);

  const productosVisibles = productos.slice(0, prodVisibleCount);

  /* ===== 7) Loading / error del emprendimiento ===== */
  if (loadingEmp) {
    return (
      <main className="min-h-screen bg-[#F7E5D2] flex items-center justify-center p-6">
        <section role="status" aria-busy="true" className="w-full max-w-5xl bg-white rounded-2xl p-8 shadow-lg animate-pulse">
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 rounded-full bg-[#E0C7B6]" />
            <div className="flex-1 space-y-4">
              <div className="h-6 w-3/4 bg-[#E0C7B6] rounded" />
              <div className="h-4 w-1/2 bg-[#E0C7B6] rounded" />
              <div className="h-3 w-full bg-[#E0C7B6] rounded" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (errorEmp || !emprendimiento) {
    return (
      <main className="min-h-screen bg-[#F7E5D2] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#1E1E2F] mb-2">Emprendimiento no encontrado</h2>
          <p className="text-gray-700 mb-6">{errorEmp || `No existe un emprendimiento con la URL: ${slug}`}</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-md font-semibold border border-[#E0C7B6] hover:bg-[#F3E1CE] transition"
            >
              Volver
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-md bg-[#AA4A44] text-white font-semibold hover:bg-[#933834] transition"
            >
              Ir a inicio
            </a>
          </div>
        </div>
      </main>
    );
  }

  /* ===== 8) Render principal ===== */
  const emp = emprendimiento;

  return (
    <main className="min-h-screen bg-[#F7E5D2]">
      {/* HERO */}
      <header className="relative bg-gradient-to-b from-[#F7E5D2] to-[#F3E1CE] border-b border-[#E0C7B6]" aria-label="Encabezado del emprendimiento">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <nav className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-[#1E1E2F] border border-transparent hover:border-[#E0C7B6] px-3 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44]"
            >
              ← Volver
            </button>
            <span className="text-xs text-gray-700">Última actualización: {formatDate(emp.updatedAt || emp.createdAt)}</span>
          </nav>

          <div className="flex items-start gap-5">
            {/* Logo / avatar */}
            <div className="flex-shrink-0">
              {emp.logo ? (
                <img
                  src={emp.logo}
                  alt={`${emp.nombreComercial} — logo`}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-[#AA4A44] shadow"
                  loading="lazy"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#E0C7B6] flex items-center justify-center text-3xl font-extrabold text-[#1E1E2F]">
                  {initials(emp.nombreComercial)}
                </div>
              )}
            </div>

            {/* Título + estado + acciones rápidas */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[#AA4A44] break-words">
                    {emp.nombreComercial}
                  </h1>
                  <p className="text-sm text-gray-700 mt-1">
                    Por: <span className="font-semibold text-[#1E1E2F]">{emprendedorNombre}</span>
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${estadoStyles}`}>
                    {emp.estado || '—'}
                  </span>

                  {/* Toggle comentarios */}
                  <button
                    type="button"
                    onClick={() => setCommentsOpen((s) => !s)}
                    aria-expanded={commentsOpen}
                    aria-controls="comments-section"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] bg-white text-[#AA4A44] text-xs md:text-sm font-semibold hover:bg-[#F7E5D2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44]"
                    title={commentsOpen ? 'Ocultar comentarios' : 'Mostrar comentarios'}
                  >
                    💬 Comentarios
                    <span className="sr-only">{commentsOpen ? 'Ocultar' : 'Mostrar'}</span>
                  </button>

                  {/* Favorito Emprendimiento */}
                  <HeartButton
                    filled={favoritesSet.has(String(emp._id))}
                    onClick={(e) => handleFavoriteEmprendimiento(e, emp)}
                    ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                    className="w-auto px-3"
                    size="sm"
                    fullWidth={false}
                    showLabelOnMobile={false}
                  />
                </div>
              </div>

              {/* Contacto compacto */}
              <div className="mt-3 flex flex-wrap gap-3">
                {hasTel ? (
                  <a
                    href={`tel:${emp.contacto.telefono}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] text-sm hover:shadow-sm"
                  >
                    📞 {emp.contacto.telefono}
                  </a>
                ) : (
                  <span className="px-3 py-2 rounded-md border border-[#E0C7B6] text-sm text-gray-500">
                    Teléfono no disponible
                  </span>
                )}

                {hasMail && (
                  <a
                    href={`mailto:${emp.contacto.email}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] text-sm hover:shadow-sm"
                  >
                    ✉️ {emp.contacto.email}
                  </a>
                )}

                {hasWeb && (
                  <a
                    href={emp.contacto.sitioWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#AA4A44] text-white text-sm font-semibold hover:bg-[#933834] transition"
                  >
                    🌐 Sitio web
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
          {/* Descripción */}
          <section className="mt-2 text-gray-800 leading-relaxed">
            <h2 className="text-lg font-semibold text-[#1E1E2F] mb-2">Descripción</h2>
            <p className="text-sm">{emp.descripcion || 'Sin descripción proporcionada.'}</p>
          </section>

          {/* Ubicación / horario (mostrar solo si existe horario) */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E2F] mb-1">Ubicación</h3>
              <p className="text-sm text-gray-700">{emp.ubicacion?.direccion || '—'}</p>
              <p className="text-sm text-gray-700">{emp.ubicacion?.ciudad || '—'}</p>
            </div>

            {emp.horario ? (
              <div>
                <h3 className="text-sm font-semibold text-[#1E1E2F] mb-1">Horario</h3>
                <p className="text-sm text-gray-700">{emp.horario}</p>
              </div>
            ) : null}
          </section>

          {/* Redes */}
          {(emp.contacto?.facebook || emp.contacto?.instagram) && (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-[#1E1E2F] mb-2">Redes</h3>
              <div className="flex flex-wrap gap-3 items-center">
                {emp.contacto?.facebook && (
                  <a
                    href={emp.contacto.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-[#1E1E2F] hover:text-[#AA4A44]"
                  >
                    Facebook
                  </a>
                )}
                {emp.contacto?.instagram && (
                  <a
                    href={emp.contacto.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-[#1E1E2F] hover:text-[#AA4A44]"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Productos (comportamiento como en HomeContent) */}
          <section className="mt-8" aria-labelledby="productos-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="productos-title" className="text-lg font-semibold text-[#1E1E2F]">Productos</h3>
              <p className="text-sm text-gray-600">
                Mostrando del <strong>1</strong> al <strong>{Math.min(prodVisibleCount, productos.length)}</strong> de{' '}
                <strong>{productos.length}</strong> productos
              </p>
            </div>

            {loadingProds ? (
              <p className="text-sm text-gray-600">Cargando productos…</p>
            ) : errorProds ? (
              <p className="text-sm text-red-600">{errorProds}</p>
            ) : productos.length === 0 ? (
              <p className="text-sm text-gray-600">Este emprendimiento no tiene productos publicados.</p>
            ) : (
              <>
                <div
                  id="grid-productos"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
                  aria-live="polite"
                >
                  {productosVisibles.map((producto) => {
                    const empr = producto.emprendimiento ?? emp ?? {};
                    const dueño = empr?.emprendedor ?? null;
                    const isFav = favoritesSet.has(String(producto._id));
                    const precioNum = Number(producto?.precio);

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

                          <p className="text-lg font-bold text-[#28a745] mb-2">
                            {Number.isFinite(precioNum) ? fmtUSD.format(precioNum) : '—'}
                          </p>

                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            Stock: {producto.stock ?? '—'}
                          </p>
                        </div>

                        {/* BOTONES PRODUCTOS */}
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
          </section>

          {/* COMENTARIOS (toggle) */}
          <section className="mt-10 border-t border-[#E0C7B6] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1E1E2F]">Comentarios</h3>
              <button
                type="button"
                onClick={() => setCommentsOpen((s) => !s)}
                aria-expanded={commentsOpen}
                aria-controls="comments-section"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] bg-white text-[#AA4A44] text-sm font-semibold hover:bg-[#F7E5D2] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44]"
              >
                {commentsOpen ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div id="comments-section" className={`${commentsOpen ? 'mt-4' : 'mt-4 hidden'}`} aria-hidden={!commentsOpen}>
              <CommentsSection
                API_BASE={API_BASE}
                destinoTipo="Emprendimiento"
                destinoId={emp._id}
                className="bg-white"
              />
            </div>
          </section>
        </article>

        {/* Footer / acciones secundarias */}
        <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-md border border-[#E0C7B6] bg-white text-[#1E1E2F] font-semibold hover:bg-[#F3E1CE] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44]"
          >
            Volver al inicio
          </button>
          <a
            href={hasWeb ? emp.contacto.sitioWeb : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-md text-white font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44] ${
              hasWeb ? 'bg-[#AA4A44] hover:bg-[#933834]' : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={(e) => {
              if (!hasWeb) e.preventDefault();
            }}
          >
            Visitar sitio
          </a>
        </div>
      </div>

      {/* MODAL: Producto seleccionado */}
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
              <p className="text-3xl font-black text-[#28a745] mb-4">
                {fmtUSD.format(Number(productoSeleccionado.precio ?? 0))}
              </p>
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
                    {productoSeleccionado.emprendimiento?.nombreComercial ?? emp?.nombreComercial ?? '—'}
                  </p>
                </div>
              </div>

              <p className="text-sm">
                <strong className="text-gray-800">Emprendedor:</strong>{' '}
                {productoSeleccionado.emprendimiento?.emprendedor
                  ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${
                      productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''
                    }`.trim()
                  : (emp?.emprendedor
                      ? `${emp.emprendedor.nombre ?? ''} ${emp.emprendedor.apellido ?? ''}`.trim()
                      : '—')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const empr = productoSeleccionado.emprendimiento ?? emp ?? {};
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

            {/* ✅ Comentarios para PRODUCTO */}
            <CommentsSection
              API_BASE={API_BASE}
              destinoTipo="Producto"
              destinoId={productoSeleccionado?._id}
              className="mt-8"
            />
          </div>
        </div>
      )}

      {/* Barra fija inferior en mobile (acciones rápidas) */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/95 backdrop-blur-sm border-t border-[#E0C7B6] p-3 flex items-center justify-between z-40">
        <a
          href={hasTel ? `tel:${emp.contacto.telefono}` : '#'}
          className={`px-3 py-2 rounded-md text-sm font-semibold border ${
            hasTel ? 'border-[#AA4A44] text-[#AA4A44]' : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!hasTel) e.preventDefault();
          }}
        >
          📞 Llamar
        </a>
        <a
          href={hasMail ? `mailto:${emp.contacto.email}` : '#'}
          className={`px-3 py-2 rounded-md text-sm font-semibold border ${
            hasMail ? 'border-[#AA4A44] text-[#AA4A44]' : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!hasMail) e.preventDefault();
          }}
        >
          ✉️ Email
        </a>
        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          className="px-3 py-2 rounded-md bg-[#AA4A44] text-white text-sm font-semibold hover:bg-[#933834] transition"
        >
          💬 Comentarios
        </button>
      </div>
    </main>
  );
}
