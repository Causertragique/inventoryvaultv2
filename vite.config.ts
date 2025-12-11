import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always use an external API during development; Vite proxies /api
export default defineConfig(() => {
  const externalApiUrl = process.env.VITE_API_URL || "http://localhost:4000";

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: ["./", "./client", "./shared"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
      proxy: {
        "/api": {
          target: externalApiUrl,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist/spa",
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-toast'],
            'utils-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    optimizeDeps: {
      exclude: ["better-sqlite3"],
    },
  };
});
