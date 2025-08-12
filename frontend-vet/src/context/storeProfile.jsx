import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

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
      toast.error("Rol no reconocido");
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
      if (!prefix) return;

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/perfil`;
      const respuesta = await axios.get(url, getAuthHeaders());
      set({ user: respuesta.data });
    } catch (error) {
      toast.dismiss(); // Limpiar toasts previos
      toast.error("No se pudo obtener el perfil del usuario");
    }
  },

  updateProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return;

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/${id}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      set({ user: respuesta.data });
      
      toast.dismiss(); // Evitar notificaciones acumuladas
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.msg || "Error al actualizar perfil");
    }
  },

  updatePasswordProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return;

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/actualizarpassword/${id}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      
      toast.dismiss();
      toast.success(respuesta?.data?.msg || "Contraseña actualizada");
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.msg || "Error al actualizar contraseña");
    }
  }
}));

export default storeProfile;
