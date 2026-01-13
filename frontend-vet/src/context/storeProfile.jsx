
import { create } from "zustand";
import axios from "axios";

const getStoredAuth = () => {
  const stored = JSON.parse(localStorage.getItem("auth-token"));
  return stored?.state || {};
};

const getAuthHeaders = () => {
  const { token } = getStoredAuth();
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

// Para multipart: dejamos que axios gestione el boundary automáticamente
const getAuthHeadersMultipart = () => {
  const { token } = getStoredAuth();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getEndpointPrefix = (rol) => {
  switch (rol) {
    case "Administrador": return "administradores";
    case "Cliente":       return "clientes";
    case "Emprendedor":   return "emprendedores";
    default:              return null;
  }
};

const storeProfile = create((set) => ({
  user: null,

  clearUser: () => set({ user: null }),

  // Obtener mi perfil (usa el rol para armar el prefix)
  profile: async () => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/perfil`;
      const respuesta = await axios.get(url, getAuthHeaders());
      set({ user: respuesta.data });
      return { success: true, data: respuesta.data };
    } catch (_error) {
      return { success: false, error: "No se pudo obtener el perfil del usuario" };
    }
  },

  // Actualizar datos básicos del perfil
  updateProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      // /api/administradores/administradore/:id
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/${id}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      set({ user: respuesta.data });
      return { success: true, data: respuesta.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar perfil" };
    }
  },

  // Actualizar contraseña
  updatePasswordProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      // /api/administradores/administradore/actualizarpassword/:id
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/actualizarpassword/${id}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      return { success: true, msg: respuesta?.data?.msg || "Contraseña actualizada" };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar contraseña" };
    }
  },

  /* ============================
     📸 FOTO DE PERFIL (SOLO DISPOSITIVO)
     Igual que Emprendimientos (Cloudinary)
  ============================ */

  // Subir/actualizar foto con archivo local (FormData campo "foto")
  updateProfilePhotoFile: async (file, id) => {
    try {
      if (!file) return { success: false, error: "No se seleccionó archivo" };

      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      // Endpoint: PUT /api/<prefix>/<singular>/foto/:id
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;

      const fd = new FormData();
      fd.append("foto", file); // 👈 el backend espera el campo "foto"

      const respuesta = await axios.put(url, fd, getAuthHeadersMultipart());

      // El backend puede responder { msg, admin } o el doc directamente
      const updatedUser = respuesta.data?.admin ?? respuesta.data;
      set({ user: updatedUser });

      return {
        success: true,
        data: updatedUser,
        msg: respuesta.data?.msg || "Foto actualizada",
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar foto" };
    }
  },

  // Eliminar foto de perfil
  deleteProfilePhoto: async (id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      // Endpoint: DELETE /api/<prefix>/<singular>/foto/:id
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;
      const respuesta = await axios.delete(url, getAuthHeaders());

      const updatedUser = respuesta.data?.admin ?? respuesta.data;
      set({ user: updatedUser });

      return {
        success: true,
        data: updatedUser,
        msg: respuesta.data?.msg || "Foto eliminada",
      };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al eliminar foto" };
    }
  },
}));

export default storeProfile;
