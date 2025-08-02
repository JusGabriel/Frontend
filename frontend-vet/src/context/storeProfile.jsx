import { create } from "zustand";
import axios from "axios";
import storeAuth from "./storeAuth";

const getAuthHeaders = () => {
  const { token } = storeAuth.getState();
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

const storeProfile = create((set) => ({
  user: null,
  setUser: (usuario) => set({ user: usuario }),
  clearUser: () => set({ user: null }),

  profile: async () => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/administradores/perfil`;
      const res = await axios.get(url, getAuthHeaders());
      set({ user: res.data });
    } catch (error) {
      console.error(error);
    }
  },

  updateProfile: async (data, id) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/administradores/admin/${id}`;
      const res = await axios.put(url, data, getAuthHeaders());
      set({ user: res.data });
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updatePasswordProfile: async (data, id) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/administradores/admin/actualizarpassword/${id}`;
      const res = await axios.put(url, data, getAuthHeaders());
      return res;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}));

export default storeProfile;
