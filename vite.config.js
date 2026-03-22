import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // This will remove all console.log and debugger statements
    drop: ['console', 'debugger'],
  },
})
