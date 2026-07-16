import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  // Relative Basis: funktioniert unverändert auf GitHub Pages
  // (https://<user>.github.io/<repo>/) und lokal, egal wie das Repo heißt.
  base: './',
  server: {
    port: 3000,
  },
  plugins: [viteReact()],
})
