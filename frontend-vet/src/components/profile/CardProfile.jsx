
// src/components/profile/CardProfile.jsx
import React, { useState } from "react";
import storeProfile from "../../context/storeProfile";
import storeAuth from "../../context/storeAuth";

export const CardProfile = () => {
  const { user, updateProfilePhotoFile, updateProfilePhotoUrl, deleteProfilePhoto } = storeProfile();
  const { id: authId } = storeAuth();
  const [preview, setPreview] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [busy, setBusy] = useState(false);

  // ID del usuario (del store del perfil si existe; si no, usamos el persistido en auth)
  const userId = user?._id || authId;

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId || busy) return;
    setBusy(true);

    // Vista previa local (opcional)
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const res = await updateProfilePhotoFile(file, userId);
      if (!res.success) {
        alert(res.error || "Error al actualizar la foto");
        setPreview(null);
      } else {
        alert(res.msg || "Foto actualizada");
      }
    } catch (err) {
      console.error("onFileChange error:", err);
      alert("Error inesperado al subir la foto");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  const onApplyUrl = async () => {
    if (!fotoUrl || !userId || busy) return;
    setBusy(true);
    try {
      const res = await updateProfilePhotoUrl(fotoUrl, userId);
      if (!res.success) {
        alert(res.error || "Error al actualizar la foto (URL)");
      } else {
        alert(res.msg || "Foto actualizada (URL)");
        setPreview(null);
        setFotoUrl("");
      }
    } catch (err) {
      console.error("onApplyUrl error:", err);
      alert("Error inesperado al actualizar por URL");
    } finally {
      setBusy(false);
    }
  };

  const onDeletePhoto = async () => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      const res = await deleteProfilePhoto(userId);
      if (!res.success) {
        alert(res.error || "Error al eliminar la foto");
      } else {
        alert(res.msg || "Foto eliminada");
        setPreview(null);
      }
    } catch (err) {
      console.error("onDeletePhoto error:", err);
      alert("Error inesperado al eliminar la foto");
    } finally {
      setBusy(false);
    }
  };

  const currentPhoto = preview ?? user?.foto ?? "https://cdn-icons-png.flaticon.com/512/4715/4715329.png";

  return (
    <div className="card-profile">
      <style>{`
        .card-profile, .card-left, .card-right, .field-group, .field-label, .field-value {
          box-sizing: border-box;
          font-family: 'Playfair Display', serif;
        }
        .card-profile {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 750px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }
        .card-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          min-width: 0;
        }
        .image-wrapper {
          position: relative;
          width: 7rem;
          height: 7rem;
          flex-shrink: 0;
        }
        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          background-color: #f3f3f3;
        }
        .camera-label {
          position: absolute;
          bottom: 0;
          right: 0;
          background-color: #AA4A44;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.4rem;
          height: 2.4rem;
          font-size: 1rem;
          user-select: none;
          transition: transform 120ms ease, box-shadow 120ms ease;
        }
        .camera-label:hover { transform: scale(1.03); }
        .camera-label:active { transform: scale(0.98); }
        .camera-input { display: none; }
        .card-right {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          min-width: 0;
        }
        .field-group { display: flex; flex-direction: column; min-width: 0; }
        .field-label { font-size: 0.9rem; color: #999; font-weight: 500; margin-bottom: 0.3rem; }
        .field-value { font-size: 1rem; font-weight: 600; color: #3B2F2F; overflow-wrap: anywhere; word-break: break-word; }
        @media (max-width: 768px) {
          .card-profile { grid-template-columns: 1fr; padding: 1.25rem; gap: 1.25rem; }
          .card-right { grid-template-columns: 1fr; }
          .image-wrapper { width: 6rem; height: 6rem; }
          .camera-label { width: 2.2rem; height: 2.2rem; font-size: 0.95rem; }
        }
        @media (max-width: 480px) {
          .card-profile { padding: 1rem; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
          .image-wrapper { width: 5rem; height: 5rem; }
          .camera-label { width: 2rem; height: 2rem; font-size: 0.9rem; }
          .field-label { font-size: 0.8rem; }
          .field-value { font-size: 0.9rem; }
        }
      `}</style>

      {/* Izquierda: Foto + acciones */}
      <div className="card-left">
        <div className="image-wrapper">
          <img
            src={currentPhoto}
            alt="Foto de perfil"
            className="profile-image"
            loading="lazy"
          />
          <label className="camera-label" title="Cambiar foto" aria-label="Cambiar foto">
            📷
            <input
              className="camera-input"
              type="file"
              accept="image/*"
              aria-label="Seleccionar nueva foto de perfil"
              onChange={onFileChange}   // 👈 ahora sí sube al backend
              disabled={busy}
            />
          </label>
        </div>

        {/* Actualizar por URL */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input
            type="url"
            placeholder="https://... (URL de imagen)"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            style={{ width: 260, padding: '0.4rem', border: '1px solid #ccc', borderRadius: 8 }}
            disabled={busy}
          />
          <button
            onClick={onApplyUrl}
            disabled={busy || !fotoUrl}
            style={{ padding: '0.4rem 0.8rem', background: '#AA4A44', color: '#fff', borderRadius: 8 }}
          >
            Usar URL
          </button>
        </div>

        {/* Eliminar foto */}
        <button
          onClick={onDeletePhoto}
          disabled={busy}
          style={{ marginTop: 8, padding: '0.4rem 0.8rem', background: '#f3f3f3', borderRadius: 8 }}
        >
          Eliminar foto
        </button>
      </div>

      {/* Derecha: Datos */}
      <div className="card-right">
        <div className="field-group">
          <span className="field-label">Nombre</span>
          <span className="field-value">{user?.nombre || "No registrado"}</span>
        </div>
        <div className="field-group">
          <span className="field-label">Apellido</span>
          <span className="field-value">{user?.apellido || "No registrado"}</span>
        </div>
        <div className="field-group">
          <span className="field-label">Teléfono</span>
          <span className="field-value">{user?.telefono || "No registrado"}</span>
        </div>
        <div className="field-group">
          <span className="field-label">Correo</span>
          <span className="field-value">{user?.email || "No registrado"}</span>
        </div>
      </div>
    </div>
  );
};
