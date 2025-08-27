import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

export default defineConfig(({ mode, command }) => {
  if (command === 'build') {
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

  return {};
});
