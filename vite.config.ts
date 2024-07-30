import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['/server/'],
  },
  compress: {
    // keep_fnames: /^.*/, // Use a regular expression to match all function names
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxying websockets or socket.io: ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
      '/socket.io': {
        target: 'ws://localhost:9000',
        ws: true,
      },
      cors: {
        "origin": "http://localhost:5173",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      },
    },
  },
  publicDir: 'alpaca' // Silences warnings when serving from public folder"
})
