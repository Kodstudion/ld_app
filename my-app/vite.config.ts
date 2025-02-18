import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Ändra från "/REPO_NAMN/" till "./" för att hantera sökvägar dynamiskt
  build: {
    outDir: "dist",
    assetsDir: "assets", // Sätter rätt sökväg för CSS och JS-filer
  }
})
