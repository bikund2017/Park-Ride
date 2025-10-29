import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js,ts,tsx}",
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http:
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http:
        changeOrigin: true,
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet']
        }
      }
    }
  }
})
