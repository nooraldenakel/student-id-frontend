import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    server: {
        proxy: {
            '/student': {
                target: 'https://student-id-info-back-production.up.railway.app',
                changeOrigin: true
            }
        }
    }
});