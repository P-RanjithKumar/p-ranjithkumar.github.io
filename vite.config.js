import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensure relative paths for GitHub Pages
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0 // Keep assets separate for easier debugging if needed
  }
});
