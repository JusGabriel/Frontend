// src/pages/Profile.jsx
import React, { useEffect, useState, useCallback } from 'react';
import CardPassword from '../components/profile/CardPassword';
import { CardProfile } from '../components/profile/CardProfile';
import FormProfile from '../components/profile/FormProfile';
import fondoBlanco from '../assets/fondoblanco.jpg';
import storeAuth from '../context/storeAuth';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://backend-production-bd1d.up.railway.app';

const Profile = () => {
  const navigate = useNavigate();
  const { id: usuarioId, token } = storeAuth() || {};
  const [favorites, setFavorites] = useState([]); // array de docs de Favorito
  const [loadingFavs, setLoadingFavs] = useState(false);

  // Para mostrar modal/card de producto favorito
  const [productoModal, setProductoModal] = useState(null); // { fav, meta } o null

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setFavorites([]);
      return;
    }
    setLoadingFavs(true);
    try {
      const res = await fetch(`${API_BASE}/api/favoritos/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn('No se pudieron cargar favoritos:', await res.text());
        setFavorites([]);
        setLoadingFavs(false);
        return;
      }
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetchFavorites:', err);
      setFavorites([]);
    } finally {
      setLoadingFavs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (favDoc) => {
    if (!token) {
      navigate('/login?rol=cliente');
      return;
    }
    try {
      await fetch(`${API_BASE}/api/favoritos/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemId: favDoc.item,
          itemModel: favDoc.itemModel,
          meta: favDoc.meta || {},
        }),
      });
    } catch (err) {
      console.error('Error toggleFavorite:', err);
    } finally {
      // refrescar la lista (mantenemos simple y consistente)
      fetchFavorites();
      // cerrar modal si era el mismo item
      if (productoModal?.fav?._id === favDoc._id) setProductoModal(null);
    }
  };

  const openItem = (fav) => {
    // Si es Producto -> abrir modal/card con info
    if (fav.itemModel === 'Producto') {
      setProductoModal({ fav, meta: fav.meta || {} });
      return;
    }

    // Emprendimiento: si slug -> abrir sitio público; si no, navegar a detalle interno
    if (fav.itemModel === 'Emprendimiento') {
      if (fav.meta?.slug) {
        const url = `${window.location.origin}/${fav.meta.slug}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      // fallback interno (ajusta ruta si la tuya es distinta)
      navigate(`/emprendimiento/${fav.item}`);
      return;
    }

    // fallback genérico
    if (fav.meta?.slug) {
      const url = `${window.location.origin}/${fav.meta.slug}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/item/${fav.item}`);
    }
  };

  // Helpers para el modal producto
  const handleContactarDesdeModal = (meta) => {
    // intentamos obtener id del emprendedor desde meta.emprendimiento._id
    const emprId = meta?.emprendimiento?._id || meta?.emprendimientoId || null;
    if (!emprId) {
      // si no hay id de emprendedor, solo cerrar modal
      setProductoModal(null);
      return;
    }
    if (!usuarioId) {
      navigate('/login?rol=cliente');
      return;
    }
    // ejemplo: ruta de chat con query productoId y productoNombre (ajusta a tu app)
    navigate(
      `/dashboard/chat?user=${emprId}&productoId=${productoModal.fav.item}&productoNombre=${encodeURIComponent(
        meta.nombre || ''
      )}`
    );
    setProductoModal(null);
  };

  return (
    <div
      className="relative flex flex-col min-h-screen w-full"
      style={{
        backgroundImage: `url(${fondoBlanco})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* ENCABEZADO */}
      <main className="py-5 px-6 bg-[#F7E5D2] text-gray-900 relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 w-full">
          <div className="flex-1 text-center md:text-left px-2">
            <p className="text-gray-700 text-base">Este módulo te permite gestionar el perfil del usuario</p>
          </div>
        </div>
      </main>

      {/* CONTENIDO PRINCIPAL */}
      <main
        className="flex-grow px-6 md:px-16 py-10 relative z-10 w-full"
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        {/* FILA SUPERIOR: dos columnas (formulario | profile+password) */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Columna izquierda: FormProfile */}
            <div className="w-full">
              <FormProfile />
            </div>

            {/* Columna derecha: CardProfile + CardPassword */}
            <div className="w-full flex flex-col gap-6">
              <CardProfile />
              <CardPassword />
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: Favoritos centrado */}
        <div className="w-full">
          <div className="mx-auto w-full md:w-3/4 lg:w-2/3">
            <section className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#AA4A44] mb-4">Favoritos</h3>

              {loadingFavs ? (
                <p className="text-gray-600">Cargando favoritos...</p>
              ) : favorites.length === 0 ? (
                <p className="text-gray-600">No tienes favoritos aún.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {favorites.map((fav) => (
                    <div
                      key={fav._id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 border p-3 rounded-lg"
                    >
                      <img
                        src={fav.meta?.imagen || '/placeholder.png'}
                        alt={fav.meta?.nombre || 'Item favorito'}
                        className="w-full sm:w-20 h-20 object-cover rounded-md flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{fav.meta?.nombre || '—'}</p>
                        <p className="text-xs text-gray-500">
                          {fav.itemModel} {fav.meta?.precio ? `· $${fav.meta.precio}` : null}
                        </p>
                        {fav.itemModel === 'Producto' && fav.meta?.descripcion && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{fav.meta.descripcion}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => openItem(fav)}
                          className="text-sm px-3 py-2 bg-white border border-[#AA4A44] text-[#AA4A44] rounded-md hover:bg-[#AA4A44] hover:text-white transition"
                        >
                          Ver
                        </button>

                        <button
                          onClick={() => toggleFavorite(fav)}
                          className="text-sm px-3 py-2 bg-[#AA4A44] text-white rounded-md hover:bg-[#933834] transition"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* MODAL / CARD PRODUCTO FAVORITO */}
      {productoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          onClick={() => setProductoModal(null)}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl z-10 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProductoModal(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
              aria-label="Cerrar"
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={productoModal.meta?.imagen || '/placeholder.png'}
                alt={productoModal.meta?.nombre || 'Producto'}
                className="w-full md:w-56 h-48 object-cover rounded-xl flex-shrink-0"
              />

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#AA4A44] mb-2">{productoModal.meta?.nombre || '—'}</h2>
                {productoModal.meta?.precio && (
                  <p className="text-3xl font-extrabold text-[#28a745] mb-3">${productoModal.meta.precio}</p>
                )}
                <p className="text-gray-700 mb-4">{productoModal.meta?.descripcion || 'Sin descripción.'}</p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleContactarDesdeModal(productoModal.meta)}
                    className="px-5 py-3 bg-[#AA4A44] text-white rounded-xl font-semibold hover:bg-[#933834] transition"
                  >
                    💬 Contactar
                  </button>

                  <button
                    onClick={() => toggleFavorite(productoModal.fav)}
                    className="px-5 py-3 bg-white border border-[#AA4A44] text-[#AA4A44] rounded-xl font-semibold hover:bg-[#AA4A44] hover:text-white transition"
                  >
                    Quitar de favoritos
                  </button>

                  <button
                    onClick={() => setProductoModal(null)}
                    className="px-5 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
