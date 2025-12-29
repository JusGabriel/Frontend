
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentsSection from '../components/CommentsSection';

/**
 * EmprendimientoPublico.jsx
 * Página pública de un emprendimiento.
 * UX-UI:
 * - Header "hero" con identidad visual
 * - Tarjeta con datos principales y acciones claras
 * - Sección de productos relacionada (mini-grid)
 * - Comentarios con acordeón (toggle) y lazy render
 * - Accesible (roles ARIA, labels, focus-visible)
 *
 * Paleta QuitoEmprende:
 *  - Oscuro: #1E1E2F
 *  - Accent: #AA4A44
 *  - Claro:  #F7E5D2
 *  - Neutro: #F3E1CE / #E0C7B6
 */

const API_BASE = 'https://backend-production-bd1d.up.railway.app';

export default function EmprendimientoPublico() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [emprendimiento, setEmprendimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UX: comentarios colapsables (mobile cerrado, desktop abierto)
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const [commentsOpen, setCommentsOpen] = useState(isDesktop);

  useEffect(() => {
    if (!slug) {
      setError('No se proporcionó un identificador (slug).');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
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
        if (err.name === 'AbortError') return;
        console.error('Error cargando emprendimiento:', err);
        setError(err.message || 'Ocurrió un error al cargar el emprendimiento.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [slug]);

  // Helpers
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

  // Skeleton
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7E5D2] flex items-center justify-center p-6">
        <section
          role="status"
          aria-busy="true"
          className="w-full max-w-5xl bg-white rounded-2xl p-8 shadow-lg animate-pulse"
        >
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

  // Error
  if (error || !emprendimiento) {
    return (
      <main className="min-h-screen bg-[#F7E5D2] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl p-8 shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#1E1E2F] mb-2">Emprendimiento no encontrado</h2>
          <p className="text-gray-700 mb-6">{error || `No existe un emprendimiento con la URL: ${slug}`}</p>

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

  // Datos
  const emp = emprendimiento;

  // Derivar nombre de emprendedor robusto
  const emprendedorNombre =
    emp.emprendedor && (emp.emprendedor.nombre || emp.emprendedor.nombres)
      ? `${emp.emprendedor.nombre || emp.emprendedor.nombres} ${emp.emprendedor.apellido || emp.emprendedor.apellidos || ''}`.trim()
      : '—';

  // Estado pill
  const estado = (emp.estado || '').toString().toLowerCase();
  const estadoStyles =
    estado === 'activo' || estado === 'correcto'
      ? 'bg-[#E6F7ED] text-[#1a7f3a]'
      : 'bg-[#FFF4F0] text-[#AA4A44]';

  // Acciones
  const hasTel = Boolean(emp.contacto?.telefono);
  const hasMail = Boolean(emp.contacto?.email);
  const hasWeb = Boolean(emp.contacto?.sitioWeb);

  return (
    <main className="min-h-screen bg-[#F7E5D2]">
      {/* HERO */}
      <header
        className="relative bg-gradient-to-b from-[#F7E5D2] to-[#F3E1CE] border-b border-[#E0C7B6]"
        aria-label="Encabezado del emprendimiento"
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <nav className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-sm font-medium text-[#1E1E2F] border border-transparent hover:border-[#E0C7B6] px-3 py-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AA4A44]"
            >
              ← Volver
            </button>
            <span className="text-xs text-gray-700">
              Última actualización: {formatDate(emp.updatedAt || emp.createdAt)}
            </span>
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

                  {/* Acción comentar (abre/cierra sección) */}
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
        {/* Tarjeta principal */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
          {/* Descripción */}
          <section className="mt-2 text-gray-800 leading-relaxed">
            <h2 className="text-lg font-semibold text-[#1E1E2F] mb-2">Descripción</h2>
            <p className="text-sm">{emp.descripcion || 'Sin descripción proporcionada.'}</p>
          </section>

          {/* Ubicación / horario */}
          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E2F] mb-1">Ubicación</h3>
              <p className="text-sm text-gray-700">{emp.ubicacion?.direccion || '—'}</p>
              <p className="text-sm text-gray-700">{emp.ubicacion?.ciudad || '—'}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E2F] mb-1">Horario</h3>
              <p className="text-sm text-gray-700">{emp.horario || 'No especificado'}</p>
            </div>
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

          {/* Productos relacionados */}
          {Array.isArray(emp.productos) && emp.productos.length > 0 && (
            <section className="mt-8">
              <h3 className="text-lg font-semibold text-[#1E1E2F] mb-3">Productos destacados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {emp.productos.slice(0, 6).map((p) => (
                  <article
                    key={p._id || p.id || `${p.nombre}-${p.imagen}`}
                    className="group flex items-center gap-3 p-3 border border-[#E0C7B6] rounded-xl hover:shadow-md transition cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      // Si tienes ruta pública por producto, llévalo allí. Si no, queda como tarjeta informativa.
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#AA4A44] truncate">{p.nombre}</p>
                      <p className="text-xs text-gray-700 line-clamp-2">{p.descripcion}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* COMENTARIOS (acordeón) */}
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

            {/* Contenedor colapsable */}
            <div
              id="comments-section"
              className={`${commentsOpen ? 'mt-4' : 'mt-4 hidden'}`}
              aria-hidden={!commentsOpen}
            >
              {/* ⚠️ Importante: CommentsSection se encarga de auth y permisos,
                  solo hay que pasar destinoTipo + destinoId */}
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

      {/* Barra fija inferior en mobile (acciones rápidas) */}
      <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/95 backdrop-blur-sm border-t border-[#E0C7B6] p-3 flex items-center justify-between z-40">
        <a
          href={hasTel ? `tel:${emp.contacto.telefono}` : '#'}
          className={`px-3 py-2 rounded-md text-sm font-semibold border ${
            hasTel
              ? 'border-[#AA4A44] text-[#AA4A44]'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => { if (!hasTel) e.preventDefault(); }}
        >
          📞 Llamar
        </a>
        <a
          href={hasMail ? `mailto:${emp.contacto.email}` : '#'}
          className={`px-3 py-2 rounded-md text-sm font-semibold border ${
            hasMail
              ? 'border-[#AA4A44] text-[#AA4A44]'
              : 'border-gray-300 text-gray-400 cursor-not-allowed'
          }`}
          onClick={(e) => { if (!hasMail) e.preventDefault(); }}
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
