import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist'
    },
    server: {
        proxy: {
            '/student': {
                target: 'https://student-id-info-back-production.up.railway.app',
                changeOrigin: true,
            },
        }
    }
})
