import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import path from 'path';
import { defineConfig } from 'vite';
import svgLoader from 'vite-svg-loader';
import checker from 'vite-plugin-checker';
// import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 7001,
  },
  plugins: [
    vue(),
    svgLoader(),
    checker({
      overlay: false,
      vueTsc: true,
      typescript: true,
      eslint: {
        lintCommand: 'eslint . --ext .vue,.js,.cjs,.ts,.tsx',
      },
    }),
    // dts({
    //   staticImport: true,
    //   outputDir: 'dist/types',
    //   exclude: ['dist', 'build'],
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/', import.meta.url)),
      '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
      types: fileURLToPath(new URL('./types', import.meta.url)),
    },
    dedupe: ['vue'],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/vue-grid.ts'),
      name: 'VueGrid',
      fileName: (format) => `vue-grid.${format}.js`,
    },
    cssCodeSplit: false,
    cssTarget: 'chrome61',
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
        exports: 'named',
      },
    },
  },
});
