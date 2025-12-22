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
      // Useamos el endpoint toggle mandando itemId, itemModel, meta
      const res = await fetch(`${API_BASE}/api/favoritos/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          itemId: favDoc.item,
          itemModel: favDoc.itemModel,
          meta: favDoc.meta || {},
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn('toggleFavorite error:', text);
      }
      // refrescar la lista
      fetchFavorites();
    } catch (err) {
      console.error('Error toggleFavorite:', err);
    }
  };

  const openItem = (fav) => {
    // Si tenemos slug en meta, abrimos la url pública
    if (fav?.meta?.slug) {
      const url = `${window.location.origin}/${fav.meta.slug}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    // Si es producto y no hay slug, intenta abrir detalle interno (ajusta si tienes rutas)
    if (fav.itemModel === 'Producto') {
      // asumo ruta interna /producto/:id (ajusta a tu routing real)
      navigate(`/producto/${fav.item}`);
      return;
    }
    if (fav.itemModel === 'Emprendimiento') {
      navigate(`/emprendimiento/${fav.item}`);
      return;
    }
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
        <div className="flex flex-col md:flex-row gap-8 relative w-full h-full">
          {/* Línea divisoria */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-300"></div>

          {/* Columna izquierda: FormProfile */}
          <div className="w-full md:w-1/2 pr-0 md:pr-10 relative z-10 h-full">
            <FormProfile />
          </div>

          {/* Columna derecha: CardProfile + CardPassword + Favoritos */}
          <div className="flex flex-col w-full md:w-1/2 pl-0 md:pl-10 space-y-6 relative z-10 h-full">
            <CardProfile />
            <CardPassword />

            {/* SECCIÓN FAVORITOS */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-[#AA4A44] mb-4">Favoritos</h3>

              {loadingFavs ? (
                <p className="text-gray-600">Cargando favoritos...</p>
              ) : favorites.length === 0 ? (
                <p className="text-gray-600">No tienes favoritos aún.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {favorites.map((fav) => (
                    <div key={fav._id} className="flex items-center gap-4 border p-3 rounded-lg">
                      <img
                        src={fav.meta?.imagen || '/placeholder.png'}
                        alt={fav.meta?.nombre || 'Item favorito'}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{fav.meta?.nombre || '—'}</p>
                        <p className="text-xs text-gray-500">
                          {fav.itemModel} {fav.meta?.precio ? `· $${fav.meta.precio}` : null}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
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
    </div>
  );
};

export default Profile;
