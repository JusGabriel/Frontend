import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// IMÁGENES
import fondoblanco from '../assets/fondoblanco.jpg';
import heroImage from '../assets/QuitoHome.jpg';
import politicasPdf from '../assets/Politicas_QuitoEmprende.pdf';

// Placeholder externo
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/800x600?text=Sin+imagen';

// ====== CONFIGURACIÓN PAGINACIÓN UX/UI (client-side) ======
const PRODUCTS_PAGE_SIZE = 8;
const EMPS_PAGE_SIZE = 8;

// Obtener URL de API desde env (Vite/CRA) y fallback
const API_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'https://backend-production-bd1d.up.railway.app'
).replace(/\/+$/, '');

// Helper: resuelve la URL final de la imagen
function resolveImageUrl(imgPath) {
  if (!imgPath) return DEFAULT_PLACEHOLDER;
  const trimmed = String(imgPath).trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads')) {
    return `${API_URL}${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${API_URL}/${trimmed}`;
  }
  return DEFAULT_PLACEHOLDER;
}

// -------------------------- Iconos --------------------------
const IconUser = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 21a8 8 0 10-16 0" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStore = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M3 9l1-3h16l1 3" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9v8a2 2 0 002 2h10a2 2 0 002-2V9" stroke="#AA4A44" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="#AA4A44" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Corazón
const IconHeartSvg = ({ filled = false, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
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
 * HeartButton - botón reutilizable para "Me encanta"
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
      <span className={`inline-flex items-center justify-center rounded-full flex-none ${filled ? 'bg-[#AA4A44] text-white' : 'bg-white text-[#AA4A44] border border-[#EADBD3]'} w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-150`}>
        <IconHeartSvg filled={filled} size={16} />
      </span>
      <span className={`text-xs sm:text-sm md:text-sm font-medium leading-none ${filled ? 'text-[#333] sm:text-white' : 'text-[#AA4A44]'} hidden sm:inline`}>
        {label}
      </span>
    </button>
  );
};

// -------------------------- Componentes UI --------------------------
const Header = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#1E1E2F] border-b border-[#F7E5D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-[#AA4A44]">QuitoEmprende</h2>
          <nav className="flex items-center gap-4 md:hidden">
            <Link
              to="/login?rol=cliente"
              className="inline-block bg-[#AA4A44] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#933834] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44]"
              aria-label="Abrir formulario de inicio de sesión"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>

        {/* Contenedor del buscador */}
        <div className="flex-1">{children}</div>

        {/* CTA en desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            to="/login?rol=cliente"
            className="inline-block bg-[#AA4A44] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#933834] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44]"
            aria-label="Abrir formulario de inicio de sesión"
          >
            Iniciar sesión
          </Link>
        </nav>
      </div>
    </header>
  );
};

/* ===================== Footer clickeable al PDF ===================== */
const Footer = () => (
  <footer className="bg-[#F3E1CE] py-6 text-center text-sm text-gray-700 mt-10 border-t border-[#E0C7B6]">
    <a
      href={politicasPdf}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-700 no-underline hover:text-[#AA4A44] transition-colors cursor-pointer"
      aria-label="Ver políticas y derechos de QuitoEmprende en PDF"
      title="Abrir políticas (PDF) en una pestaña nueva"
    >
      © 2025 QuitoEmprende. Todos los derechos reservados.
    </a>
  </footer>
);

// Tarjeta de rol (igual que tu versión)
const RoleCard = ({ title, subtitle, features = [], to, variant = 'primary', icon }) => {
  return (
    <div className="bg-[#F7E5D2] border border-[#E0C7B6] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-[#AA4A44]" tabIndex={0}>
      <div className="flex items-start gap-4">
        <div className="flex-none">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#AA4A44]">{title}</h3>
          <p className="text-gray-700 mt-1">{subtitle}</p>

          {features.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-gray-600">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#AA4A44] mr-2" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={to}
              className={`inline-block px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44] ${
                variant === 'primary'
                  ? 'bg-[#AA4A44] text-white hover:bg-[#933834]'
                  : 'bg-white text-[#AA4A44] border border-[#AA4A44] hover:bg-white/90'
              }`}
            >
              {title.includes('Cliente') ? 'Iniciar como Cliente' : 'Iniciar como Emprendedor'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===================== COMPONENTE BUSCADOR ===================== */

/**
 * Destaca el término en el texto con <mark>
 */
function highlight(text, term) {
  if (!text || !term) return text;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${safe})`, 'ig');
  return text.split(re).map((chunk, i) =>
    re.test(chunk) ? <mark key={i} className="bg-yellow-200">{chunk}</mark> : <span key={i}>{chunk}</span>
  );
}

const SearchBar = ({
  onResults,
  onClear,
  API_URL,
}) => {
  const [term, setTerm] = useState('');
  const [suggestions, setSuggestions] = useState({ productos: [], emprendimientos: [], emprendedores: [] });
  const [open, setOpen] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [errorSuggest, setErrorSuggest] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // navegación por teclado
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  // Cierra dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce de sugerencias
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      const q = term.trim();
      if (q.length < 2) {
        setSuggestions({ productos: [], emprendimientos: [], emprendedores: [] });
        setOpen(false);
        setErrorSuggest(null);
        setLoadingSuggest(false);
        return;
      }
      try {
        setLoadingSuggest(true);
        setErrorSuggest(null);
        const res = await fetch(`${API_URL}/api/search/suggest?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        const data = await res.json();
        setSuggestions(data?.sugerencias || { productos: [], emprendimientos: [], emprendedores: [] });
        setOpen(true);
        setActiveIndex(0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setErrorSuggest('No se pudo obtener sugerencias');
        }
      } finally {
        setLoadingSuggest(false);
      }
    }, 350);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [term]);

  // Lista plana para navegación con teclado (mezclar tipos)
  const flatList = [
    ...suggestions.productos.map(s => ({ type: 'producto', value: s })),
    ...suggestions.emprendimientos.map(s => ({ type: 'emprendimiento', value: s })),
    ...suggestions.emprendedores.map(s => ({ type: 'emprendedor', value: s })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    try {
      onClear();
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}&types=productos,emprendimientos,emprendedores&limit=12&page=1`);
      const data = await res.json();
      onResults({ ...data, q });
      setOpen(false);
    } catch (err) {
      onResults({ error: 'No se pudo realizar la búsqueda' });
    }
  };

  const handleKeyDown = async (e) => {
    if (!open || flatList.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatList.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatList[activeIndex];
      if (!item) return;
      // Al elegir sugerencia, usa su texto principal como consulta
      const q = (
        item.type === 'producto' ? (item.value?.nombre || item.value?.empNombreComercial) :
        item.type === 'emprendimiento' ? (item.value?.nombreComercial || item.value?.ownerNombreCompleto) :
        (item.value?.nombre ? `${item.value?.nombre} ${item.value?.apellido || ''}`.trim() : item.value?.email)
      ) || term.trim();

      try {
        onClear();
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}&types=productos,emprendimientos,emprendedores&limit=12&page=1`);
        const data = await res.json();
        onResults({ ...data, q });
        setOpen(false);
      } catch {
        onResults({ error: 'No se pudo realizar la búsqueda' });
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex items-stretch gap-2" role="search" aria-label="Buscador global">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar productos, emprendimientos o emprendedores…"
            aria-label="Buscar"
            className="w-full px-4 py-2 rounded-md border border-[#E0C7B6] bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#AA4A44]"
          />
          {/* Estado de carga de sugerencias */}
          {loadingSuggest && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Buscando…</span>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-[#AA4A44] text-white text-sm font-semibold hover:bg-[#933834] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#AA4A44]"
          aria-label="Buscar"
          title="Buscar"
        >
          Buscar
        </button>
      </form>

      {/* Dropdown de sugerencias */}
      {open && (
        <div
          className="absolute mt-2 w-full bg-white border border-[#E0C7B6] rounded-md shadow-lg z-50"
          role="listbox"
          aria-label="Sugerencias de búsqueda"
        >
          {errorSuggest && (
            <div className="px-3 py-2 text-sm text-red-600">{errorSuggest}</div>
          )}
          {!errorSuggest && flatList.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-600">Sin sugerencias</div>
          )}
          {flatList.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={`${item.type}-${idx}`}
                role="option"
                aria-selected={isActive}
                className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between hover:bg-[#F7E5D2] ${isActive ? 'bg-[#F7E5D2]' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const q = (
                    item.type === 'producto' ? (item.value?.nombre || item.value?.empNombreComercial) :
                    item.type === 'emprendimiento' ? (item.value?.nombreComercial || item.value?.ownerNombreCompleto) :
                    (item.value?.nombre ? `${item.value?.nombre} ${item.value?.apellido || ''}`.trim() : item.value?.email)
                  ) || term.trim();
                  onClear();
                  fetch(`${API_URL}/api/search?q=${encodeURIComponent(q)}&types=productos,emprendimientos,emprendedores&limit=12&page=1`)
                    .then(r => r.json())
                    .then(d => onResults({ ...d, q }))
                    .catch(() => onResults({ error: 'No se pudo realizar la búsqueda' }));
                  setOpen(false);
                }}
              >
                <span className="text-gray-800">
                  {item.type === 'producto' && (
                    <>
                      <span className="font-semibold text-[#AA4A44]">{highlight(item.value?.nombre || item.value?.empNombreComercial, term)}</span>
                      {item.value?.empNombreComercial && <span className="text-gray-600"> · {highlight(item.value?.empNombreComercial, term)}</span>}
                    </>
                  )}
                  {item.type === 'emprendimiento' && (
                    <>
                      <span className="font-semibold text-[#AA4A44]">{highlight(item.value?.nombreComercial, term)}</span>
                      {item.value?.ownerNombreCompleto && <span className="text-gray-600"> · {highlight(item.value?.ownerNombreCompleto, term)}</span>}
                    </>
                  )}
                  {item.type === 'emprendedor' && (
                    <>
                      <span className="font-semibold text-[#AA4A44]">
                        {highlight(`${item.value?.nombre || ''} ${item.value?.apellido || ''}`.trim() || item.value?.email, term)}
                      </span>
                      {item.value?.email && <span className="text-gray-600"> · {item.value?.email}</span>}
                    </>
                  )}
                </span>
                <span className="text-[11px] text-gray-500 uppercase">{item.type}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ===================== Sección de resultados de búsqueda ===================== */

const SearchResults = ({
  data,
  query,
  onClose,
  navigate,
  fmtUSD,
  handleAddFavoriteRedirect,
}) => {
  const [activeTab, setActiveTab] = useState('todos'); // todos | productos | emprendimientos | emprendedores

  if (!data) return null;
  if (data?.error) {
    return (
      <section className="bg-white py-6 px-6 border-b border-[#E0C7B6]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-[#AA4A44]">Resultados</h2>
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-[#AA4A44]"
              aria-label="Cerrar resultados"
            >
              Cerrar
            </button>
          </div>
          <p className="text-red-600">No se pudo realizar la búsqueda.</p>
        </div>
      </section>
    );
  }

  const productos = data?.results?.productos || [];
  const emprendimientos = data?.results?.emprendimientos || [];
  const emprendedores = data?.results?.emprendedores || [];

  const total = (data?.counts?.productos || 0) + (data?.counts?.emprendimientos || 0) + (data?.counts?.emprendedores || 0);

  return (
    <section className="bg-white py-10 px-6 border-b border-[#E0C7B6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-2xl font-extrabold text-[#AA4A44]">
            Resultados para “{query}”
          </h2>
          <div className="text-sm text-gray-600">
            {total} resultados ·
            <button onClick={onClose} className="ml-2 underline text-[#AA4A44]">Limpiar</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'todos', label: `Todos (${total})` },
            { id: 'productos', label: `Productos (${data?.counts?.productos || 0})` },
            { id: 'emprendimientos', label: `Emprendimientos (${data?.counts?.emprendimientos || 0})` },
            { id: 'emprendedores', label: `Emprendedores (${data?.counts?.emprendedores || 0})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full border text-sm ${
                activeTab === tab.id ? 'bg-[#AA4A44] text-white border-[#AA4A44]' : 'bg-white text-[#AA4A44] border-[#AA4A44]'
              }`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenidos */}
        {(activeTab === 'todos' || activeTab === 'productos') && (
          <>
            <h3 className="text-xl font-bold text-[#AA4A44] mb-3">Productos</h3>
            {productos.length === 0 ? (
              <p className="text-gray-600 mb-6">Sin productos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full mb-8">
                {productos.map((p) => {
                  const imgSrc = resolveImageUrl(p.imagen);
                  return (
                    <article
                      key={`prod-${p._id}-${p.nombre}-${p.empNombreComercial}`}
                      className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all"
                    >
                      <img
                        src={imgSrc}
                        alt={p.nombre}
                        className="w-full h-44 object-cover rounded-lg mb-3"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
                      />
                      <h4 className="font-semibold text-lg text-[#AA4A44]">{p.nombre}</h4>
                      {p.empNombreComercial && (
                        <p className="text-sm text-gray-600 mt-1"><strong>Emprendimiento:</strong> {p.empNombreComercial}</p>
                      )}
                      {typeof p.precio === 'number' && (
                        <p className="mt-2 text-lg font-bold text-[#28a745]">{fmtUSD.format(Number(p.precio ?? 0))}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.descripcion}</p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <HeartButton
                          filled={false}
                          onClick={(e) => handleAddFavoriteRedirect(e)}
                          label="Me encanta"
                          ariaLabel={`Agregar ${p.nombre} a favoritos`}
                          className="w-full justify-center"
                        />
                        <button
                          onClick={() => navigate('/login?rol=cliente')}
                          className="w-full bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                          aria-label={`Contactar ${p.nombre}`}
                        >
                          Contactar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {(activeTab === 'todos' || activeTab === 'emprendimientos') && (
          <>
            <h3 className="text-xl font-bold text-[#AA4A44] mb-3">Emprendimientos</h3>
            {emprendimientos.length === 0 ? (
              <p className="text-gray-600 mb-6">Sin emprendimientos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full mb-8">
                {emprendimientos.map((emp) => {
                  const logoSrc = resolveImageUrl(emp.logo);
                  return (
                    <div
                      key={`emp-${emp._id}-${emp.slug || emp.nombreComercial}`}
                      className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col"
                      onClick={() => navigate(`/${encodeURIComponent(emp.slug || emp.nombreComercial)}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/${encodeURIComponent(emp.slug || emp.nombreComercial)}`);
                        }
                      }}
                    >
                      <img
                        src={logoSrc}
                        alt={emp.nombreComercial}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h4>
                        {emp.ownerNombreCompleto && (
                          <p className="text-sm text-gray-700 font-semibold mt-1">{emp.ownerNombreCompleto}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>
                        <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${encodeURIComponent(emp.slug || emp.nombreComercial)}`);
                          }}
                          className="bg-[#AA4A44] text-white w-full py-2 rounded-md text-sm hover:bg-[#933834] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                        >
                          Ver sitio
                        </button>
                        <HeartButton
                          filled={false}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/login?rol=cliente');
                          }}
                          label="Me encanta"
                          ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                          className="w-full justify-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {(activeTab === 'todos' || activeTab === 'emprendedores') && (
          <>
            <h3 className="text-xl font-bold text-[#AA4A44] mb-3">Emprendedores</h3>
            {emprendedores.length === 0 ? (
              <p className="text-gray-600">Sin emprendedores.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emprendedores.map((owner) => (
                  <div key={`own-${owner._id}-${owner.email}`} className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F7E5D2] flex items-center justify-center text-[#AA4A44] font-bold">
                        {(owner.nombre?.[0] || 'E')}{(owner.apellido?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-semibold text-[#AA4A44]">{(owner.nombre || '') + ' ' + (owner.apellido || '')}</p>
                        <p className="text-xs text-gray-600">{owner.email}</p>
                      </div>
                    </div>
                    {owner.telefono && <p className="mt-2 text-sm text-gray-700">Tel: {owner.telefono}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

/* ===================== HOME ===================== */
export const Home = () => {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState(null);

  // Estados de UX/Paginación (client-side)
  const [prodVisibleCount, setProdVisibleCount] = useState(PRODUCTS_PAGE_SIZE);
  const [empVisibleCount, setEmpVisibleCount] = useState(EMPS_PAGE_SIZE);

  // Estados del buscador
  const [searchData, setSearchData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Carga de datos iniciales
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/emprendimientos/publicos`, { signal: ac.signal });
        const data = await res.json();
        setEmprendimientos(Array.isArray(data) ? data : []);
        setEmpVisibleCount(EMPS_PAGE_SIZE);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Error al cargar emprendimientos:', error);
      }
    })();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos/todos`, { signal: ac.signal });
        const data = await res.json();
        const productosArray = Array.isArray(data) ? data : (Array.isArray(data?.productos) ? data.productos : []);
        setProductos(productosArray);
        setProdVisibleCount(PRODUCTS_PAGE_SIZE);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Error al cargar productos:', error);
      }
    })();
    return () => ac.abort();
  }, []);

  const buildPublicUrl = (emp) => {
    const slug = emp?.slug || emp?.nombreComercial;
    return `/${encodeURIComponent(slug)}`;
  };

  const nombreCompletoEmprendedor = (emp) => {
    const e = emp?.emprendedor;
    if (!e) return '—';
    const nombre = e.nombre ?? e.nombres ?? '';
    const apellido = e.apellido ?? e.apellidos ?? '';
    return `${nombre} ${apellido}`.trim() || '—';
  };

  const handleAddFavoriteRedirect = (e) => {
    e?.stopPropagation?.();
    navigate('/login?rol=cliente');
  };

  // Derivados visibles (client-side)
  const productosVisibles = productos.slice(0, prodVisibleCount);
  const emprVisibles     = emprendimientos.slice(0, empVisibleCount);

  // Formateador de precio (UX local Ecuador - USD)
  const fmtUSD = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

  // Callbacks del buscador
  const handleSearchResults = (payload) => {
    if (payload?.error) {
      setSearchData(payload);
      setSearchQuery('');
      return;
    }
    setSearchData(payload);
    setSearchQuery(payload?.q || '');
    // Scroll a resultados
    try {
      const el = document.getElementById('search-results-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  };

  const handleSearchClear = () => {
    setSearchData(null);
    setSearchQuery('');
  };

  return (
    <>
      {/* Header con buscador */}
      <Header>
        <SearchBar
          onResults={handleSearchResults}
          onClear={handleSearchClear}
          API_URL={API_URL}
        />
      </Header>

      {/* Hero */}
      <section className="bg-white py-12 px-6 border-b border-[#E0C7B6]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#AA4A44] mb-2">¿Cómo deseas usar QuitoEmprende?</h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">Elige la opción que mejor se adapte a tus necesidades.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard
              title="Iniciar sesión como Cliente"
              subtitle="Explora productos reales, guarda favoritos y contacta directamente con emprendedores."
              features={[
                'Buscar y filtrar productos',
                'Favoritos y chat con emprendedores'
              ]}
              to="/login?rol=cliente"
              variant="primary"
              icon={<IconUser />}
            />

            <RoleCard
              title="Iniciar sesión como Emprendedor"
              subtitle="Publica productos, crea tu página y gestiona pedidos y promociones."
              features={[
                'Página personalizada para tu emprendimiento',
                'Gestión de productos y stock',
                'Herramientas de promoción sencillas'
              ]}
              to="/login?rol=emprendedor"
              variant="primary"
              icon={<IconStore />}
            />
          </div>
        </div>
      </section>

      {/* Anchor para scroll automático a resultados */}
      <div id="search-results-anchor" />

      {/* Resultados del buscador (si hay) */}
      {searchData && (
        <SearchResults
          data={searchData}
          query={searchQuery}
          onClose={handleSearchClear}
          navigate={navigate}
          fmtUSD={fmtUSD}
          handleAddFavoriteRedirect={handleAddFavoriteRedirect}
        />
      )}

      {/* Sección principal */}
      <main className="py-20 px-6 bg-[#F7E5D2] text-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-extrabold uppercase text-4xl md:text-5xl text-[#AA4A44] mb-4">Conecta, vende y crece</h1>
            <p className="text-xl md:text-2xl mb-6 text-gray-800">QuitoEmprende: Tu espacio digital</p>
            <p className="max-w-2xl text-gray-700 mx-auto md:mx-0">
              Un lugar donde los emprendedores promocionan productos y reciben su propia página personalizada.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link to="/login?rol=cliente" className="inline-block bg-[#AA4A44] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-[#933834] transition-colors">
                Iniciar como Cliente
              </Link>
              <Link to="/login?rol=emprendedor" className="inline-block bg-white text-[#AA4A44] px-5 py-2 rounded-md text-sm font-semibold border border-[#AA4A44] hover:bg-white/90">
                Iniciar como Emprendedor
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src={heroImage}
              alt="Hero"
              className="w-full max-w-xl rounded-[15px] shadow-xl object-cover border-2 border-[#AA4A44]"
              loading="lazy"
            />
          </div>
        </div>
      </main>

      <div className="max-w-7xl mx-auto my-6 h-[3px] bg-gradient-to-r from-[#AA4A44] via-transparent to-[#AA4A44]" />

      {/* PRODUCTOS */}
      <section className="py-10 px-6 bg-white text-gray-800" aria-labelledby="productos-title">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 id="productos-title" className="text-3xl font-bold text-[#AA4A44] text-center mb-2">Productos Destacados</h2>

          {/* Estado/contador UX */}
          <p className="text-sm text-gray-600 mb-6">
            Mostrando <strong>{Math.min(prodVisibleCount, productos.length)}</strong> de <strong>{productos.length}</strong> productos
          </p>

          {productos.length === 0 ? (
            <p className="text-gray-600">Cargando productos...</p>
          ) : (
            <>
              <div
                id="grid-productos"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full"
                aria-live="polite"
              >
                {productosVisibles.map((producto) => {
                  const empr = producto.emprendimiento ?? {};
                  const dueño = empr?.emprendedor ?? null;
                  const imgSrc = resolveImageUrl(producto.imagen);

                  return (
                    <article
                      key={producto._id}
                      className="bg-white border border-[#E0C7B6] rounded-xl p-4 shadow hover:shadow-lg transition-all cursor-pointer"
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
                        src={imgSrc}
                        alt={producto.nombre}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
                      />

                      <h3 className="font-semibold text-lg text-[#AA4A44]">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>
                      <p className="mt-3 text-lg font-bold text-[#28a745]">{fmtUSD.format(Number(producto.precio ?? 0))}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">Stock: {producto.stock ?? '—'}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Emprendimiento:</strong> {empr?.nombreComercial ?? '—'}</p>
                      <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {dueño ? `${dueño.nombre ?? ''} ${dueño.apellido ?? ''}`.trim() || '—' : '—'}</p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="w-full">
                          <HeartButton
                            filled={false}
                            onClick={(e) => handleAddFavoriteRedirect(e)}
                            label="Me encanta"
                            ariaLabel={`Agregar ${producto.nombre} a favoritos`}
                            className="w-full justify-center"
                          />
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/login?rol=cliente'); }}
                          className="w-full bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                          aria-label={`Contactar ${producto.nombre}`}
                        >
                          Contactar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Botón "Mostrar más" */}
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
        style={{ backgroundImage: `url(${fondoblanco})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        aria-labelledby="empr-title"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 id="empr-title" className="text-3xl font-bold text-[#AA4A44] text-center mb-2">Explora Emprendimientos</h2>

          {/* Estado/contador UX */}
          <p className="text-sm text-gray-600 mb-6">
            Mostrando <strong>{Math.min(empVisibleCount, emprendimientos.length)}</strong> de <strong>{emprendimientos.length}</strong> emprendimientos
          </p>

          <div
            id="grid-empr"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full"
            aria-live="polite"
          >
            {emprVisibles.map((emp) => {
              const logoSrc = resolveImageUrl(emp.logo);
              return (
                <div
                  key={emp._id}
                  className="bg-white rounded-2xl shadow-md border border-[#E0C7B6] p-5 hover:shadow-lg transition-all cursor-pointer flex flex-col"
                  onClick={() => navigate(buildPublicUrl(emp))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(buildPublicUrl(emp));
                    }
                  }}
                >
                  <img
                    src={logoSrc}
                    alt={emp.nombreComercial}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#AA4A44]">{emp.nombreComercial}</h3>
                    <p className="text-sm text-gray-700 font-semibold mt-1">{nombreCompletoEmprendedor(emp)}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{emp.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-2">{emp.ubicacion?.ciudad} - {emp.ubicacion?.direccion}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEmprendimientoSeleccionado(emp);
                      }}
                      className="bg-[#AA4A44] text-white w-full py-2 rounded-md text-sm hover:bg-[#933834] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
                    >
                      Ver detalles
                    </button>

                    <div className="w-full">
                      <HeartButton
                        filled={false}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFavoriteRedirect(e);
                        }}
                        label="Me encanta"
                        ariaLabel={`Agregar ${emp.nombreComercial} a favoritos`}
                        className="w-full justify-center"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón "Mostrar más" */}
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
              {empVisibleCount >= emprendimientos.length ? 'No hay más emprendimientos' : 'Mostrar más emprendimientos'}
            </button>
          </div>
        </div>
      </section>

      {/* MODAL PRODUCTO */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="producto-modal-title"
          onClick={() => setProductoSeleccionado(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setProductoSeleccionado(null);
          }}
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
              src={resolveImageUrl(productoSeleccionado.imagen)}
              alt={productoSeleccionado.nombre}
              className="w-full h-48 object-cover rounded-md mb-4"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
            />

            <h2 id="producto-modal-title" className="text-xl font-bold text-[#AA4A44]">{productoSeleccionado.nombre}</h2>
            <p className="text-gray-600 mt-2">{productoSeleccionado.descripcion}</p>
            <p className="font-bold text-[#28a745] mt-3 text-lg">{fmtUSD.format(Number(productoSeleccionado.precio ?? 0))}</p>
            <p className="font-semibold text-gray-800 mt-2">Stock disponible: {productoSeleccionado.stock ?? '—'}</p>
            <p className="text-sm text-gray-600 mt-2"><strong>Emprendimiento:</strong> {productoSeleccionado.emprendimiento?.nombreComercial ?? '—'}</p>
            <p className="text-sm text-gray-600 mt-1"><strong>Emprendedor:</strong> {productoSeleccionado.emprendimiento?.emprendedor ? `${productoSeleccionado.emprendimiento.emprendedor.nombre ?? ''} ${productoSeleccionado.emprendimiento.emprendedor.apellido ?? ''}`.trim() || '—' : '—'}</p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <HeartButton
                filled={false}
                onClick={(e) => handleAddFavoriteRedirect(e)}
                label="Agregar a favoritos"
                ariaLabel={`Agregar ${productoSeleccionado.nombre} a favoritos`}
                className="w-full justify-center"
              />

              <button
                onClick={() => { navigate('/login?rol=cliente'); }}
                className="w-full mt-2 bg-[#AA4A44] text-white py-2 rounded-md text-sm hover:bg-[#933834] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#AA4A44]"
              >
                Contactar (iniciar sesión)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMPRENDIMIENTO */}
      {emprendimientoSeleccionado && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="empr-modal-title"
          onClick={() => setEmprendimientoSeleccionado(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEmprendimientoSeleccionado(null);
          }}
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
              src={resolveImageUrl(emprendimientoSeleccionado.logo)}
              alt={emprendimientoSeleccionado.nombreComercial}
              className="w-full h-48 object-cover rounded-md mb-4"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER; }}
            />

            <h2 id="empr-modal-title" className="text-xl font-bold text-[#AA4A44]">{emprendimientoSeleccionado.nombreComercial}</h2>

            <p className="text-gray-800 font-bold text-sm mt-1">Emprendedor: {nombreCompletoEmprendedor(emprendimientoSeleccionado)}</p>

            <p className="text-gray-600 mt-2">{emprendimientoSeleccionado.descripcion}</p>

            <p className="text-sm text-gray-500 mt-2">{emprendimientoSeleccionado.ubicacion?.ciudad} – {emprendimientoSeleccionado.ubicacion?.direccion}</p>

            <div className="flex gap-3 mt-4 flex-wrap text-sm">
              {emprendimientoSeleccionado.contacto?.sitioWeb && (
                <a href={emprendimientoSeleccionado.contacto.sitioWeb} target="_blank" rel="noreferrer noopener" className="text-[#007bff] hover:underline">Sitio web</a>
              )}

              {emprendimientoSeleccionado.contacto?.facebook && (
                <a href={emprendimientoSeleccionado.contacto.facebook} target="_blank" rel="noreferrer noopener" className="text-[#3b5998] hover:underline">Facebook</a>
              )}

              {emprendimientoSeleccionado.contacto?.instagram && (
                <a href={emprendimientoSeleccionado.contacto.instagram} target="_blank" rel="noreferrer noopener" className="text-[#C13584] hover:underline">Instagram</a>
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

              <HeartButton
                filled={false}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddFavoriteRedirect(e);
                }}
                label="Me encanta"
                ariaLabel={`Agregar ${emprendimientoSeleccionado.nombreComercial} a favoritos`}
                className="ml-2"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Home;
