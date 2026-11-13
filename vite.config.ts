import { defineConfig } from 'vite';

export default defineConfig({
  // Chemins relatifs : le build fonctionne sur GitHub Pages (sous-dossier) comme sur Poki.
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
