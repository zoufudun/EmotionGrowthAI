import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Allow watching changes in the project
    }
  },
  optimizeDeps: {
    entries: ['index.html']
  }
})

