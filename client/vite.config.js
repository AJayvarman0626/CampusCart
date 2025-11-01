import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // ✅ this ensures assets load correctly in production
  build: {
    outDir: 'dist',
    assetsDir: '',
  },
})