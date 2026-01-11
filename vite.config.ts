import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: true,
    open: true, // Auto-open browser
  },
});
