import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 crucial for correct relative asset paths on Vercel
  build: {
    outDir: 'dist',
  },
})