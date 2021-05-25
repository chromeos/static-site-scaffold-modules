# Vite Plugin PostHTML

[Vite](https://vitejs.dev/) plugin to run [PostHTML](https://github.com/posthtml/posthtml). Currently only runs on served/built HTML files (`index.html`).

## Installation

```bash
$ npm install vite-plugin-posthtml
```

In your `vite.config.js` file:

```js
const { posthtmlPlugin } = require('vite-plugin-posthtml');

module.exports = {
  plugins: [
    posthtmlPlugin({
      /* config */
    }),
  ],
};
```

## Config

The plugin's config is an object that takes three optional properties: `plugins`, `options`, and `posthtml`:

- `plugins` - PostHTML [plugins](https://github.com/posthtml/posthtml#plugins). You can mix synchronous and asynchronous plugins; the Vite plugin will always run in asynchronous mode.
- `options` - PostHTML parser options. `sync` will always be overridden to `false`.
- `posthtml` - If you'd like to override the PostHTML function that gets called (like to use a different version), you can pass it in here.
