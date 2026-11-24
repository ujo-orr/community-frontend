import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const apiTarget = process.env.COMMUNITY_API_TARGET || 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth/login': apiTarget,
      '/api/categories': apiTarget,
      '/api/posts': apiTarget,
    },
  },
})
