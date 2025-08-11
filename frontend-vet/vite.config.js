import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: ['frontend-production-480a.up.railway.app'] // cambia al dominio que uses
  }
})
