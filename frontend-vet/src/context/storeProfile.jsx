
// src/context/storeProfile.js
import { create } from 'zustand';
import axios from 'axios';

const getStoredAuth = () => {
  const stored = JSON.parse(localStorage.getItem('auth-token'));
  return stored?.state || {};
};

const getAuthHeaders = () => {
  const { token } = getStoredAuth();
  return { headers: { Authorization: `Bearer ${token}` } };
};

const getEndpointPrefix = (rol) => {
  switch (rol) {
    case 'Administrador': return 'administradores';
    case 'Cliente':       return 'clientes';
    case 'Emprendedor':   return 'emprendedores';
    default:              return null;
  }
};

const storeProfile = create((set) => ({
  user: null,

  clearUser: () => set({ user: null }),

  profile: async () => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: 'Rol no reconocido' };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/perfil`;
      const respuesta = await axios.get(url, getAuthHeaders());
      set({ user: respuesta.data });
      return { success: true, data: respuesta.data };
    } catch {
      return { success: false, error: 'No se pudo obtener el perfil del usuario' };
    }
  },

  updateProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: 'Rol no reconocido' };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/${id}`;
      const respuesta = await axios.put(url, data, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, 'Content-Type': 'application/json' },
      });
      set({ user: respuesta.data });
      return { success: true, data: respuesta.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Error al actualizar perfil' };
    }
  },

  updatePasswordProfile: async (data, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: 'Rol no reconocido' };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/actualizarpassword/${id}`;
      const respuesta = await axios.put(url, data, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, 'Content-Type': 'application/json' },
      });
      return { success: true, msg: respuesta?.data?.msg || 'Contraseña actualizada' };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Error al actualizar contraseña' };
    }
  },

  // 👇 NUEVO: subir foto de perfil (multipart; no fijamos Content-Type)
  updateProfilePhoto: async (fileOrUrl, id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: 'Rol no reconocido' };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;
      const fd = new FormData();

      if (fileOrUrl instanceof File) fd.append('foto', fileOrUrl);
      else if (typeof fileOrUrl === 'string') fd.append('foto', fileOrUrl);
      else return { success: false, error: 'Entrada inválida para foto' };

      const respuesta = await axios.put(url, fd, getAuthHeaders());
      const admin = respuesta.data?.admin || respuesta.data;
      set({ user: admin });
      return { success: true, data: admin, msg: respuesta.data?.msg || 'Foto actualizada' };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Error al actualizar foto' };
    }
  },

  // 👇 NUEVO: eliminar foto
  deleteProfilePhoto: async (id) => {
    try {
      const { rol } = getStoredAuth();
      const prefix = getEndpointPrefix(rol);
      if (!prefix) return { success: false, error: 'Rol no reconocido' };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/${prefix}/${prefix.slice(0, -1)}/foto/${id}`;
      const respuesta = await axios.delete(url, getAuthHeaders());
      const admin = respuesta.data?.admin || null;

      // refresca el perfil tras eliminar
      const prof = await storeProfile.getState().profile();
      set({ user: prof?.data || admin });
      return { success: true, msg: respuesta.data?.msg || 'Foto eliminada' };
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Error al eliminar foto' };
    }
  },
}));

export default storeProfile;
