
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

// 👇 Para multipart: no seteamos Content-Type manualmente (lo manejará axios/FormData)
const getAuthHeadersMultipart = () => {
  const { token } = getStoredAuth();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      // Si quieres, puedes incluir 'Content-Type': 'multipart/form-data'
      // pero axios lo resolverá solo cuando el body sea FormData.
    },
  };
};

const getEndpointPrefix = (rol) => {
  switch (rol) {
    case "Administrador":
      return "administradores";
    case "Cliente":
      return "clientes";
    case "Emprendedor":
      return "emprendedores";
    default:
      return null;
  }
};

const storeProfile = create((set) => ({
  user: null,

  clearUser: () => set({ user: null }),

  profile: async () => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/perfil`;
      const respuesta = await axios.get(url, getAuthHeaders());
      set({ user: respuesta.data });
      return { success: true, data: respuesta.data };
    } catch (error) {
      return { success: false, error: "No se pudo obtener el perfil del usuario" };
    }
  },

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
     📸 FOTO DE PERFIL (Cloudinary)
     Igual que Emprendimientos
  ============================ */

  // 1) Subir archivo desde <input type="file" />
  updateProfilePhotoFile: async (file, id) => {
    try {
      if (!file) return { success: false, error: "No se seleccionó archivo" };

      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      // Endpoint: /api/administradores/administradore/foto/:id  (PUT)
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;

      const fd = new FormData();
      fd.append("foto", file); // 👈 el backend espera el campo "foto"

      const respuesta = await axios.put(url, fd, getAuthHeadersMultipart());

      // El backend responde { msg, admin } → actualizamos user con 'admin' si viene
      const updatedUser = respuesta.data?.admin ?? respuesta.data;
      set({ user: updatedUser });

      return { success: true, data: updatedUser, msg: respuesta.data?.msg || "Foto actualizada" };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar foto" };
    }
  },

  // 2) Actualizar con URL directa
  updateProfilePhotoUrl: async (fotoUrl, id) => {
    try {
      if (!fotoUrl || !String(fotoUrl).trim()) {
        return { success: false, error: "URL de foto inválida" };
      }

      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;

      const respuesta = await axios.put(
        url,
        { foto: fotoUrl },
        getAuthHeaders()
      );

      const updatedUser = respuesta.data?.admin ?? respuesta.data;
      set({ user: updatedUser });

      return { success: true, data: updatedUser, msg: respuesta.data?.msg || "Foto actualizada (URL)" };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar foto (URL)" };
    }
  },

  // 3) Eliminar foto
  deleteProfilePhoto: async (id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: "Rol no reconocido" };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;
      const respuesta = await axios.delete(url, getAuthHeaders());

      const updatedUser = respuesta.data?.admin ?? respuesta.data;
      set({ user: updatedUser });

      return { success: true, data: updatedUser, msg: respuesta.data?.msg || "Foto eliminada" };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al eliminar foto" };
    }
  },
}));

export default storeProfile;
