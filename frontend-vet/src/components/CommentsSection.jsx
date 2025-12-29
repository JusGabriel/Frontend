
// src/components/CommentsSection.jsx
import { useEffect, useState } from 'react';
import storeAuth from '../context/storeAuth';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

function getInitials(nombre = '', apellido = '') {
  const n = (nombre || '').trim();
  const a = (apellido || '').trim();
  const s = [n.split(' ')[0], a.split(' ')[0]].filter(Boolean);
  const chars = (s.join(' ') || 'U').slice(0, 2);
  return chars.toUpperCase();
}

/** Obtiene el ID del autor desde varias posibles formas del objeto */
function getAuthorId(comment) {
  const u = comment?.usuario;
  return (
    u?._id ??
    comment?.autor?._id ??
    comment?.usuarioId ??
    comment?.autorId ??
    comment?.userId ??
    null
  );
}

/** Normaliza rol para comparar */
function isAdminRole(rol) {
  const r = (rol || '').toString().trim().toLowerCase();
  return r === 'admin' || r === 'administrador' || r === 'superadmin';
}

/** Regla de visibilidad del botón Eliminar */
function canDeleteComment(comment, currentUserId, rol) {
  // Si el backend ya manda un flag explícito, úsalo.
  if (typeof comment?.puedeEliminar === 'boolean') {
    return comment.puedeEliminar;
  }
  const authorId = getAuthorId(comment);
  const isOwner =
    currentUserId && authorId && String(currentUserId) === String(authorId);
  return isOwner || isAdminRole(rol);
}

/**
 * CommentsSection
 * Props:
 * - API_BASE: string (ej: https://backend-production-bd1d.up.railway.app)
 * - destinoTipo: 'Producto' | 'Emprendimiento'
 * - destinoId: string (ObjectId del backend)
 */
export default function CommentsSection({
  API_BASE,
  destinoTipo,
  destinoId,
  className = '',
}) {
  // ✅ con tu storeAuth: id, rol y token están disponibles
  const { id: usuarioId, token, rol } = storeAuth() || {};
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista
  useEffect(() => {
    if (!destinoId || !destinoTipo) return;
    const endpoint =
      destinoTipo === 'Producto'
        ? `${API_BASE}/api/comentarios/producto/${destinoId}`
        : `${API_BASE}/api/comentarios/emprendimiento/${destinoId}`;

    setLoadingList(true);
    setError(null);

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComentarios(data);
        else setComentarios([]);
      })
      .catch(err => {
        console.error('Error listando comentarios:', err);
        setError('No se pudo cargar los comentarios');
      })
      .finally(() => setLoadingList(false));
  }, [API_BASE, destinoId, destinoTipo]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }
    const text = texto.trim();
    if (!text) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ destinoTipo, destinoId, texto: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.msg || 'Error al crear el comentario');
      }

      // Insertar al inicio
      setComentarios(prev => [data, ...prev]);
      setTexto('');
    } catch (err) {
      console.error('handleSubmit comentario error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!token) {
      alert('Debes iniciar sesión para eliminar.');
      return;
    }
    const ok = confirm('¿Eliminar comentario?');
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/comentarios/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || 'No se pudo eliminar');

      setComentarios(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className={`mt-8 ${className}`}>
      <h3 className="text-lg font-bold text-[#1E1E2F] mb-3">Comentarios</h3>

      {/* Formulario (requiere token) */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder={
            token
              ? 'Escribe tu comentario…'
              : 'Inicia sesión para comentar (Cliente, Emprendedor o Administrador)'
          }
          maxLength={1000}
          disabled={!token || loading}
          className={`w-full border rounded-md p-3 text-sm ${
            !token ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } border-[#E0C7B6]`}
          aria-label="Nuevo comentario"
          required
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={!token || loading}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
              !token || loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#AA4A44] text-white hover:bg-[#933834]'
            }`}
          >
            {loading ? 'Publicando…' : 'Publicar comentario'}
          </button>
        </div>
      </form>

      {/* Mensajes de estado */}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loadingList && <p className="text-sm text-gray-600 mb-3">Cargando comentarios…</p>}

      {/* Lista */}
      {comentarios.length === 0 ? (
        <p className="text-sm text-gray-600">No hay comentarios todavía.</p>
      ) : (
        <ul className="space-y-3">
          {comentarios.map((c) => {
            const u = c.usuario || {}; // poblado por refPath
            const nombre = [u.nombre, u.apellido].filter(Boolean).join(' ').trim();
            const badge = c.usuarioTipo || u.rol || 'Usuario';

            // ✅ Solo mostrar Eliminar al autor o a un admin
            const showDelete = token && canDeleteComment(c, usuarioId, rol);

            return (
              <li key={c._id} className="p-3 border border-[#E0C7B6] rounded-md bg-white group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F7E5D2] flex items-center justify-center text-[#AA4A44] font-bold">
                      {getInitials(u.nombre, u.apellido)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1E1E2F]">
                        {nombre || '—'}
                        <span className="ml-2 text-[11px] text-gray-600 uppercase">{badge}</span>
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>

                  {/* Botón eliminar: SOLO autor o administrador */}
                  {showDelete && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-xs text-red-600 hover:text-red-700 underline opacity-70 hover:opacity-100"
                      title="Eliminar comentario"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-800 leading-relaxed">{c.texto}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
