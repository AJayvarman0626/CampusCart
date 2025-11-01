import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Vite config for CampusCart
export default defineConfig({
  plugins: [react()],
  base: './', // this ensures proper relative paths when deployed
})