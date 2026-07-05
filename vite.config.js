import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind explicitly to IPv4 loopback — some environments have flaky/unreliable
    // IPv6 loopback, which causes intermittent hangs when Vite's default dual-stack
    // binding resolves to [::1].
    host: '127.0.0.1',
  },
})
