import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@types': resolve('src/types'),
      },
    },
    build: {
      sourcemap: true,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src'),
        '@types': resolve('src/types'),
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          'framework-preload': resolve(
            __dirname,
            'node_modules/@coffic/cosy-framework/dist/preload/index.js'
          ),
          'plugin-preload': resolve(__dirname, 'src/preload/preload-plugin.ts'),
        },
      },
    },
  },
  renderer: {
    root: resolve('src/ui'),
    resolve: {
      alias: {
        '@': resolve('src'),
        '@renderer': resolve('src/ui'),
        '@modules': resolve('src/ui/modules'),
        '@components': resolve('src/ui/components'),
        '@stores': resolve('src/ui/stores'),
        '@utils': resolve('src/ui/utils'),
        '@views': resolve('src/ui/views'),
        '@plugins': resolve('src/ui/plugins'),
        '@ipc': resolve('src/ui/ipc'),
      },
    },
    plugins: [vue(), tailwindcss()],
    build: {
      sourcemap: true,
      rollupOptions: {
        input: 'src/ui/index.html',
      },
    },
  },
});
