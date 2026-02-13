import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde .env o el sistema (Vercel)
  // Vercel expone variables de entorno automáticamente.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Reemplazamos "process.env.API_KEY" en el código fuente por el valor real
      // Priorizamos VITE_API_KEY (estándar de Vite/Vercel) y hacemos fallback a API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || '')
    }
  }
})