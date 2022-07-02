import { defineConfig } from 'vite';
import { posthtmlPlugin } from '../../index.mjs';
import doctype from 'posthtml-doctype';
import desm from 'desm';
const __dirname = desm(import.meta.url);

export default (outDir = 'dist') =>
  defineConfig({
    root: __dirname,
    logLevel: 'error',
    plugins: [
      posthtmlPlugin({
        plugins: [doctype({ doctype: 'HTML 5' })],
      }),
    ],
    build: {
      outDir,
    },
  });
