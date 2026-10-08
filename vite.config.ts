import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@schoolhub/ui': path.resolve(__dirname, 'src/vendor/schoolhub-ui/index.ts'),
      '@boredkevin/ui': path.resolve(__dirname, 'src/vendor/schoolhub-ui/index.ts'),
      '@bkui': path.resolve(__dirname, 'src/vendor/schoolhub-ui'),
      '@shui': path.resolve(__dirname, 'src/vendor/schoolhub-ui'),
    },
  },
  server: { port: 5173, strictPort: true },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('react-router')) return 'vendor-router';
          return undefined;
        },
      },
    },
  },
});
