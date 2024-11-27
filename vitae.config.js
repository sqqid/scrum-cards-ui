import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
  };
});
