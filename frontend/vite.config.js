import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/smartpharma/',
  server: {
    port: 3000,
  }
})
