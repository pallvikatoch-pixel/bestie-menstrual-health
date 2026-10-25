import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` → normal multi-file build in dist/ (for Vercel / Netlify)
// `npm run build:single` → one self-contained HTML file in dist-single/
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  build: mode === 'single'
    ? { outDir: 'dist-single', assetsInlineLimit: 100000000, cssCodeSplit: false }
    : { outDir: 'dist' },
}))
