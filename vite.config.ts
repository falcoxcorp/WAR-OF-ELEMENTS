import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error'],
        passes: 2,
        unsafe: false,
        toplevel: false,
        keep_infinity: true,
        reduce_vars: true,
        collapse_vars: true,
        join_vars: true,
        sequences: true,
        properties: true,
        dead_code: true,
        evaluate: true,
        conditionals: true,
        comparisons: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: false,
        if_return: true,
        inline: true,
        side_effects: false,
        pure_getters: false,
        negate_iife: true,
        warnings: false
      },
      mangle: {
        toplevel: false,
        eval: false,
        keep_fnames: true,
        properties: false,
        safari10: true
      },
      format: {
        comments: false,
        beautify: false,
        ascii_only: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          web3: ['web3'],
          icons: ['lucide-react'],
          toast: ['react-hot-toast']
        }
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 4096,
    emptyOutDir: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});