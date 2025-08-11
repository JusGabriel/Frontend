export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    host: true,               // Esto es equivalente a --host 0.0.0.0
    port: process.env.PORT || 4173,
    allowedHosts: ['frontend-production-480a.up.railway.app'], // tu dominio
  },
});
