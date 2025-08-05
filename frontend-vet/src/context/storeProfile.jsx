import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

// Obtener token y rol desde Zustand persistido
const getStoredAuth = () => {
  const stored = JSON.parse(localStorage.getItem("auth-token"));
  return stored?.state || {};
};

// Encabezados de autenticación
const getAuthHeaders = () => {
  const { token } = getStoredAuth();
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const storeProfile = create((set) => ({
  user: null,

  clearUser: () => set({ user: null }),

  profile: async () => {
    try {
      const { rol } = getStoredAuth();
      let endpoint = "";

      switch (rol) {
        case "admin":
          endpoint = "/api/administradores/perfil";
          break;
        case "user":
          endpoint = "/api/clientes/perfil";
          break;
        case "editor":
          endpoint = "/api/emprendedores/perfil";
          break;
        default:
          toast.error("Rol no reconocido");
          return;
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}${endpoint}`;
      const respuesta = await axios.get(url, getAuthHeaders());
      set({ user: respuesta.data });

    } catch (error) {
      console.error(error);
      toast.error("No se pudo obtener el perfil del usuario");
    }
  },

  updateProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      let endpoint = "";

      switch (rol) {
        case "admin":
          endpoint = `/api/administradores/admin/${id}`;
          break;
        case "user":
          endpoint = `/api/clientes/cliente/${id}`;
          break;
        case "editor":
          endpoint = `/api/emprendedores/emprendedor/${id}`;
          break;
        default:
          toast.error("Rol no reconocido");
          return;
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}${endpoint}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      set({ user: respuesta.data });
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Error al actualizar perfil");
    }
  },

  updatePasswordProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      let endpoint = "";

      switch (rol) {
        case "admin":
          endpoint = `/api/administradores/admin/actualizarpassword/${id}`;
          break;
        case "user":
          endpoint = `/api/clientes/cliente/actualizarpassword/${id}`;
          break;
        case "editor":
          endpoint = `/api/emprendedores/emprendedor/actualizarpassword/${id}`;
          break;
        default:
          toast.error("Rol no reconocido");
          return;
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}${endpoint}`;
      const respuesta = await axios.put(url, data, getAuthHeaders());
      toast.success(respuesta?.data?.msg || "Contraseña actualizada");
      return respuesta;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.msg || "Error al actualizar contraseña");
    }
  }
}));

export default storeProfile;
