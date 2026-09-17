import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react({
        fastRefresh: process.env.DISABLE_HMR !== 'true',
      }), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['Systemlogo.jpg'],
        manifest: {
          id: '/',
          name: 'DTR Automate',
          short_name: 'DTR Automate',
          description: 'Daily Time Record automation system',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/Systemlogo.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any',
            },
            {
              src: '/Systemlogo.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any',
            }
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true' ? { overlay: false } : false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
