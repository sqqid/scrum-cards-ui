import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          properties: true,
        },
      },
      rollupOptions: {
        treeshake: true,
      },
    },
    plugins: [react()],
  };
});
