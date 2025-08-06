import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeAuth = create(
  persist(
    (set) => ({
      token: null,
      rol: null,
      id: null,
      setToken: (token) => set({ token }),
      setRol: (rol) => set({ rol }),
      setId: (id) => set({ id }),
      clearToken: () => set({ token: null, rol: null, id: null })
    }),
    { name: "auth-token" }
  )
);

export default storeAuth;
