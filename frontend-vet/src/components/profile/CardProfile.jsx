
import React from "react";
import storeProfile from "../../context/storeProfile";

export const CardProfile = () => {
  const { user } = storeProfile();

  return (
    <div className="card-profile">
      {/* --- Estilos embebidos con media queries --- */}
      <style>{`
        /* Reset básico y tipografía */
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
          grid-template-columns: 1fr 2fr; /* Dos columnas en desktop */
          gap: 1.5rem;
        }

        .card-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          min-width: 0; /* evita que rompa el grid */
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
          background-color: #f3f3f3; /* fallback si no carga la imagen */
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
          grid-template-columns: 1fr 1fr; /* dos columnas para datos en desktop */
          gap: 1rem;
          min-width: 0;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .field-label {
          font-size: 0.9rem;
          color: #999999;
          font-weight: 500;
          margin-bottom: 0.3rem;
        }

        .field-value {
          font-size: 1rem;
          font-weight: 600;
          color: #3B2F2F;
          /* Evita desbordes en móviles: correos/teléfonos largos */
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* --- Responsivo (tablet) --- */
        @media (max-width: 768px) {
          .card-profile {
            grid-template-columns: 1fr; /* apilar izquierda y derecha */
            padding: 1.25rem;
            gap: 1.25rem;
          }
          .card-left {
            align-items: center;
          }
          .card-right {
            grid-template-columns: 1fr; /* una sola columna de campos */
          }
          .image-wrapper {
            width: 6rem;
            height: 6rem;
          }
          .camera-label {
            width: 2.2rem;
            height: 2.2rem;
            font-size: 0.95rem;
          }
          .field-label { font-size: 0.85rem; }
          .field-value { font-size: 0.95rem; }
        }

        /* --- Responsivo (móvil chico) --- */
        @media (max-width: 480px) {
          .card-profile {
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          }
          .image-wrapper {
            width: 5rem;
            height: 5rem;
          }
          .camera-label {
            width: 2rem;
            height: 2rem;
            font-size: 0.9rem;
          }
          .field-label { font-size: 0.8rem; }
          .field-value { font-size: 0.9rem; }
        }
      `}</style>

      {/* Panel Izquierdo (Foto + botón de cámara) */}
      <div className="card-left">
        <div className="image-wrapper">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4715/4715329.png"
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
            />
          </label>
        </div>
      </div>

      {/* Panel Derecho (Información del usuario) */}
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

