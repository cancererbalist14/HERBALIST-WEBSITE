import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,   // expose to local network — lets you test on phone via 192.168.x.x:3000
    open: true,
    proxy: {
      // In dev, proxy both /api and /admin to the local Express backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
