import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build directly into the root public/ directory so the Express server
// (server.js) serves the production build without any manual copy step.
// The root public/ is gitignored; the build is reproducible with `npm run build`.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public',
    emptyOutDir: true,
  },
})