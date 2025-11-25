import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/**
 * EmprendimientoPublico.jsx
 * Página pública de un emprendimiento.
 * Diseño responsivo y accesible, paleta de QuitoEmprende:
 * - Oscuro: #1E1E2F
 * - Accent:  #AA4A44
 * - Claro:   #F7E5D2
 * - Neutro:  #F3E1CE / #E0C7B6
 *
 * Usa TailwindCSS (clases utilitarias). Si tu proyecto no usa Tailwind,
 * adapta las clases a CSS/SCSS propio.
 */

export default function EmprendimientoPublico() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [emprendimiento, setEmprendimiento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) {
      setError('No se proporcionó un identificador (slug).')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `https://backend-production-bd1d.up.railway.app/api/emprendimientos/publico/${encodeURIComponent(
            slug
          )}`,
          { signal: controller.signal }
        )

        // Intentamos leer respuesta en texto para mensajes de error más claros
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Error del servidor: ${res.status}`)
        }

        const data = await res.json()
        setEmprendimiento(data)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Error cargando emprendimiento:', err)
        setError(err.message || 'Ocurrió un error al cargar el emprendimiento.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [slug])

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString()
    } catch {
      return '—'
    }
  }

  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('') || 'E'

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
    )
  }

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
    )
  }

  const emp = emprendimiento

  return (
    <main className="min-h-screen bg-[#F7E5D2] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-[#1E1E2F] border border-transparent hover:border-[#E0C7B6] px-3 py-1 rounded-md"
          >
            ← Volver
          </button>

          <span className="text-xs text-gray-600">Última actualización: {formatDate(emp.updatedAt || emp.createdAt)}</span>
        </nav>

        <article className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Imagen / logo */}
          <div className="flex items-center justify-center md:justify-start">
            {emp.logo ? (
              <img
                src={emp.logo}
                alt={`${emp.nombreComercial} — logo`}
                className="w-40 h-40 rounded-full object-cover border-4 border-[#AA4A44] shadow"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-[#E0C7B6] flex items-center justify-center text-3xl font-extrabold text-[#1E1E2F]">
                {initials(emp.nombreComercial)}
              </div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="md:col-span-2">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#AA4A44]">{emp.nombreComercial}</h1>
                <p className="text-sm text-gray-700 mt-1">Por: <span className="font-semibold text-[#1E1E2F]">{(emp.emprendedor && (emp.emprendedor.nombre || emp.emprendedor.nombres) ? `${emp.emprendedor.nombre || emp.emprendedor.nombres} ${emp.emprendedor.apellido || emp.emprendedor.apellidos || ''}` : '—')}</span></p>
              </div>

              <div className="flex gap-3 items-center">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${emp.estado === 'activo' ? 'bg-[#E6F7ED] text-[#1a7f3a]' : 'bg-[#FFF4F0] text-[#AA4A44]'}`}>
                  {emp.estado || '—'}
                </span>

                <a
                  href={`mailto:${emp.contacto?.email || ''}`}
                  onClick={(e) => { if (!emp.contacto?.email) e.preventDefault() }}
                  className="text-sm underline text-[#1E1E2F]"
                >
                  Contactar
                </a>
              </div>
            </header>

            <section className="mt-6 text-gray-800 leading-relaxed">
              <h2 className="text-lg font-semibold text-[#1E1E2F] mb-2">Descripción</h2>
              <p className="text-sm">{emp.descripcion || 'Sin descripción proporcionada.'}</p>
            </section>

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

            <section className="mt-6">
              <h3 className="text-sm font-semibold text-[#1E1E2F] mb-2">Redes y contacto</h3>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Teléfono */}
                {emp.contacto?.telefono ? (
                  <a href={`tel:${emp.contacto.telefono}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] text-sm hover:shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.6c.8 0 1.6.3 2.2.9l1.8 1.8a2 2 0 01.5 2.1L10.6 12a11 11 0 005.4 5.4l2.6-2.3a2 2 0 012.1.5l1.8 1.8c.6.6.9 1.4.9 2.2V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                    {emp.contacto.telefono}
                  </a>
                ) : (
                  <span className="px-3 py-2 rounded-md border border-[#E0C7B6] text-sm text-gray-500">Teléfono no disponible</span>
                )}

                {/* Email */}
                {emp.contacto?.email ? (
                  <a href={`mailto:${emp.contacto.email}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#E0C7B6] text-sm hover:shadow-sm">
                    ✉️ {emp.contacto.email}
                  </a>
                ) : null}

                {/* Web */}
                {emp.contacto?.sitioWeb ? (
                  <a
                    href={emp.contacto.sitioWeb}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#AA4A44] text-white text-sm hover:bg-[#933834] transition"
                  >
                    🌐 Sitio web
                  </a>
                ) : null}

                {/* Redes */}
                {emp.contacto?.facebook && (
                  <a href={emp.contacto.facebook} target="_blank" rel="noreferrer" className="text-sm underline">Facebook</a>
                )}

                {emp.contacto?.instagram && (
                  <a href={emp.contacto.instagram} target="_blank" rel="noreferrer" className="text-sm underline">Instagram</a>
                )}
              </div>
            </section>

            {/* Productos relacionados / CTA */}
            {Array.isArray(emp.productos) && emp.productos.length > 0 && (
              <section className="mt-6">
                <h3 className="text-sm font-semibold text-[#1E1E2F] mb-3">Productos destacados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emp.productos.slice(0, 4).map((p) => (
                    <div key={p._id || p.id} className="flex items-center gap-3 p-3 border border-[#E0C7B6] rounded-md">
                      <img src={p.imagen} alt={p.nombre} className="w-16 h-16 object-cover rounded-md" />
                      <div>
                        <p className="text-sm font-semibold text-[#AA4A44]">{p.nombre}</p>
                        <p className="text-xs text-gray-700">{p.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>

        {/* Footer / acciones */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-md border border-[#E0C7B6]">Volver al inicio</button>
          <a
            href={emp.contacto?.sitioWeb || '#'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-md bg-[#AA4A44] text-white hover:bg-[#933834] transition"
            onClick={(e) => { if (!emp.contacto?.sitioWeb) e.preventDefault() }}
          >
            Visitar sitio
          </a>
        </div>
      </div>
    </main>
  )
}
