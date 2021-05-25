const { defineConfig } = require('vite');
const posthtml = require('../../index');
const doctype = require('posthtml-doctype');

module.exports = (outDir = 'dist') =>
  defineConfig({
    root: __dirname,
    logLevel: 'error',
    plugins: [
      posthtml({
        plugins: [doctype({ doctype: 'HTML 5' })],
      }),
    ],
    build: {
      outDir,
    },
  });
