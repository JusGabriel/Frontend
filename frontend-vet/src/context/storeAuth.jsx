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
      clearToken: () => set({ token: null, rol: null, id: null }),

      // Estado para chat: id y rol de la persona con quien chatear
      chatUser: { id: null, rol: null },
      setChatUser: ({ id, rol }) => set({ chatUser: { id, rol } }),
      clearChatUser: () => set({ chatUser: { id: null, rol: null } }),
    }),
    { name: "auth-token" }
  )
);

export default storeAuth;
