# Rollup Plugin Workbox Inject

A [Workbox](https://developers.google.com/web/tools/workbox) plugin for
[Rollup](https://rollupjs.org/guide/en/) that allows you to use Rollup to
compile your service worker and have Workbox
[inject a precache manifest into it](https://developers.google.com/web/tools/workbox/guides/precache-files/cli).
This differs from other Rollup/Workbox plugins in that Rollup controls the
entire compiling/outputting process of the service worker instead of Workbox
moving the file over and bypassing Rollup.

## Usage

### `rollup.config.js`

```js
const replace = require('@rollup/plugin-replace');
const workbox = require('rollup-plugin-workbox-inject');

module.exports = {
  input: /*...*/,
  output: /*...*/,
  plugins: [
    // @rollup/plugin-replace is used to replace process.env.NODE_ENV
    // statements in the Workbox libraries to match your current environment.
    // This changes whether logging is enabled ('development') or disabled ('production').
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    workbox({
      globDirectory: 'public',
      globPatterns: [
        'css/**/*.css',
        'js/**/*.js'
      ],
      // ...any other options here...
    }),
  ]
}
```

The options
[supported by the `getManifest()` method in `workbox-build`](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.getManifest)
are supported in this plugin, with one addition:

- `injectionPoint`: Defaults to `'self.__WB_MANIFEST'`, but can be changed if
  you'd like to customize which string is replaced with the precache manifest in
  your source service worker file.

### Service Worker

**Requires using Workbox v5+ in your service worker file!**

```js
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

// ...any other service worker logic goes here...
```
