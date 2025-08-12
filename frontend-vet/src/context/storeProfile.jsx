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

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/actualizarpassword/${id}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      return { success: true, msg: respuesta?.data?.msg || "Contraseña actualizada" };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || "Error al actualizar contraseña" };
    }
  },
}));

export default storeProfile;
