 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Split vendor chunks — reduces main bundle, fixes "Reduce unused JS"
     rollupOptions: {
  output: {
    manualChunks(id) {
      if (
        id.includes('react') ||
        id.includes('react-dom') ||
        id.includes('react-router-dom')
      ) {
        return 'react-vendor';
      }

      if (
        id.includes('lucide-react') ||
        id.includes('react-hot-toast')
      ) {
        return 'ui-vendor';
      }

      if (id.includes('recharts')) {
        return 'chart-vendor';
      }
    },
  },
},
    // Compress output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // removes console.logs from prod
        drop_debugger: true,
      },
    },
    // Warn if any chunk > 300KB
    chunkSizeWarningLimit: 300,
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {          
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})