import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toLocaleDateString('es-MX', {
  day: '2-digit', month: '2-digit', year: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
})

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 3000,
  },
})
