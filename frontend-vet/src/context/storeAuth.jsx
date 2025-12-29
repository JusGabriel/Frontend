
import { create } from "zustand";
import { persist } from "zustand/middleware";

const storeAuth = create(
  persist(
    (set) => ({
      token: null,
      rol: null,
      id: null,

      // 🆕 Estado del cliente
      estadoUI: null,              // 'Correcto' | 'Advertencia1' | 'Advertencia2' | 'Advertencia3' | 'Suspendido'
      estado_Emprendedor: null,    // 'Activo' | 'AdvertenciaX' | 'Suspendido'
      status: true,                // boolean

      setToken: (token) => set({ token }),
      setRol:   (rol)   => set({ rol }),
      setId:    (id)    => set({ id }),

      setEstadoUI:        (estadoUI) => set({ estadoUI }),
      setEstadoInterno:   (estado_Emprendedor) => set({ estado_Emprendedor }),
      setStatus:          (status) => set({ status }),

      clearToken: () => set({
        token: null, rol: null, id: null,
        estadoUI: null, estado_Emprendedor: null, status: true
      }),

      // Estado para chat
      chatUser: { id: null, rol: null },
      setChatUser: ({ id, rol }) => set({ chatUser: { id, rol } }),
      clearChatUser: () => set({ chatUser: { id: null, rol: null } }),
    }),
    { name: "auth-token" }
  )
);

export default storeAuth;
