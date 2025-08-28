import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import dts from 'unplugin-dts/vite';

export default defineConfig(({ mode, command }) => {
  if (!process.env.DEMO && command === 'build') {
    return {
      plugins: [
        dts({
          insertTypesEntry: true,
          bundleTypes: true,
        }),
      ],
      build: {
        lib: {
          entry: './src/index.ts',
          name: 'assjs',
          fileName: (format) => `ass.${format}.js`,
        },
      },
    };
  }

  return {
    base: './',
    plugins: [
      legacy({
        targets: ['defaults', 'chrome >= 63'],
      }),
    ],
  };
});
