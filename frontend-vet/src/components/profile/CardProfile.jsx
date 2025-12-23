
// src/components/CardProfile.jsx
import { useState, useEffect } from 'react';
import storeProfile from '../../context/storeProfile';
import { useToast } from '../ToastHost.jsx'; // opcional si ya agregaste el toast

export const CardProfile = () => {
  const { user, updateProfilePhoto, deleteProfilePhoto, profile } = storeProfile();
  const { show } = useToast?.() || { show: () => {} };

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // sin blob: usar foto real del usuario como preview
    if (user?.foto) setPreview(user.foto);
  }, [user?.foto]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0] || null;
    if (!file || !user?._id) return;

    // preview local
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    // subir
    const resp = await updateProfilePhoto(file, user._id);
    // limpiar blob
    setTimeout(() => {
      if (localUrl.startsWith('blob:')) URL.revokeObjectURL(localUrl);
    }, 2000);

    if (resp.success) {
      await profile(); // refresca el perfil en store
      show('Foto actualizada', { type: 'success' });
    } else {
      show(resp.error || 'No se pudo actualizar la foto', { type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    const resp = await deleteProfilePhoto(user._id);
    if (resp.success) {
      await profile();
      setPreview(null);
      show('Foto eliminada', { type: 'success' });
    } else {
      show(resp.error || 'No se pudo eliminar la foto', { type: 'error' });
    }
  };

  return (
    <div style={cardContainer}>
      {/* Panel Izquierdo (Foto + botones) */}
      <div style={leftPanel}>
        <div style={imageWrapper}>
          <img
            src={
              preview ||
              user?.foto ||
              'https://cdn-icons-png.flaticon.com/512/4715/4715329.png'
            }
            alt="img-client"
            style={profileImage}
            onError={(e) => {
              e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/4715/4715329.png';
            }}
          />
          <label style={cameraLabel} title="Cambiar foto">
            📷
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </label>
        </div>

        {/* Acción de eliminar foto */}
        <button
          onClick={handleDelete}
          style={{
            marginTop: '0.5rem',
            background: '#DC2626',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          Eliminar foto
        </button>
      </div>

      {/* Panel Derecho (Información del usuario) */}
      <div style={rightPanel}>
        <div style={fieldGroup}>
          <span style={fieldLabel}>Nombre</span>
          <span style={fieldValue}>{user?.nombre || 'No registrado'}</span>
        </div>
        <div style={fieldGroup}>
          <span style={fieldLabel}>Apellido</span>
          <span style={fieldValue}>{user?.apellido || 'No registrado'}</span>
        </div>
        <div style={fieldGroup}>
          <span style={fieldLabel}>Teléfono</span>
          <span style={fieldValue}>{user?.telefono || 'No registrado'}</span>
        </div>
        <div style={fieldGroup}>
          <span style={fieldLabel}>Correo</span>
          <span style={fieldValue}>{user?.email || 'No registrado'}</span>
        </div>
      </div>
    </div>
  );
};

// Estilos
const cardContainer = {
  background: '#ffffff',
  padding: '1.5rem',
  borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  width: '100%',
  maxWidth: '750px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 2fr',
  gap: '1.5rem',
};
const leftPanel = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' };
const imageWrapper = { position: 'relative', width: '7rem', height: '7rem' };
const profileImage = {
  width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%',
  border: '4px solid #ffffff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};
const cameraLabel = {
  position: 'absolute', bottom: 0, right: 0, backgroundColor: '#AA4A44', color: 'white',
  padding: '0.4rem 0.6rem', borderRadius: '50%', cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)', fontSize: '1rem', userSelect: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const rightPanel = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };
const fieldGroup = { display: 'flex', flexDirection: 'column' };
const fieldLabel = {
  fontSize: '0.9rem', color: '#999999', fontWeight: '500', marginBottom: '0.3rem',
  fontFamily: "'Playfair Display', serif",
};
const fieldValue = {
  fontSize: '1rem', fontWeight: '600', color: '#3B2F2F', fontFamily: "'Playfair Display', serif",
};
