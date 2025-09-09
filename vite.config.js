import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
   server: {
    host: true, // ← this allows access from your local network
    port: 5173, // optional: use a fixed port if you like
  },
  plugins: [react()],
})
