const {defineConfig} = require('vite');
const { posthtmlPlugin } = require('vite-plugin-posthtml');
const posthtmlImg = require('./posthtml-plugin-img');

module.exports = defineConfig({
  plugins: [
    posthtmlPlugin({
      plugins: [
        posthtmlImg()
      ]
    })
  ]
});