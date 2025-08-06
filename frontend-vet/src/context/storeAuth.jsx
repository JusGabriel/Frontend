// storeAuth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeAuth = create(
  persist(
    (set) => ({
      token: null,
      rol: null,
      id: null, // <-- nuevo
      setToken: (token) => set({ token }),
      setRol: (rol) => set({ rol }),
      setId: (id) => set({ id }), // <-- nuevo setter
      clearToken: () => set({ token: null, rol: null, id: null }) // limpiar todo
    }),
    { name: "auth-token" }
  )
);

export default storeAuth;
