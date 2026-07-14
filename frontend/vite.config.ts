import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_DEV_API_TARGET || 'http://localhost/meccio/backend/api'
  const uploadTarget = env.VITE_DEV_UPLOAD_TARGET || 'http://localhost/meccio/backend/uploads'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        // Local convenience if relative /backend/uploads paths appear
        '/backend/uploads': {
          target: uploadTarget.replace(/\/backend\/uploads\/?$/, ''),
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('framer-motion') || id.includes('gsap')) return 'motion'
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor'
            }
          },
        },
      },
    },
  }
})
