import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.VITE_API_URL)
  return {
    build: {
      outDir: 'build',
      // minify: 'terser',
      // terserOptions: {
      //   compress: {
      //     drop_console: true,
      //     drop_debugger: true
      //   },
      //   mangle: {
      //     toplevel: true,
      //     module: true,
      //   },
      // },
      // rollupOptions: {
      //   treeshake: true,
      // },
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),

          configure: (proxy, _) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('error', err);
            });
            proxy.on('proxyReq', (_, req, _res) => {
              console.log('Request sent to target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Response received from target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  };
});
