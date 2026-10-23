import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const target = process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || env.VITE_API_URL || 'http://127.0.0.1:8000'
  const apiProxy = { target, changeOrigin: true, secure: true, cookieDomainRewrite: '' }
  return {
    plugins: [react()],
    resolve: { dedupe: ['react', 'react-dom'], alias: { '@': resolve(__dirname, 'src') } },
    server: {
      host: '127.0.0.1',
      port: 5174,
      strictPort: true,
      proxy: {
        '/api': apiProxy,
        '/sanctum': apiProxy,
      },
    },
  }
})
