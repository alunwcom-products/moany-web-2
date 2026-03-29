import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Tell Vite to use oxc for minification
    minify: 'oxc',
    
    // Currently, OXC's 'drop' is often configured via terser-like options 
    // or passed directly to the compressor if supported by your version

    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
  },
})