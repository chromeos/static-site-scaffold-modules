# Rollup Plugin Workbox Inject

A [Workbox](https://developers.google.com/web/tools/workbox) plugin for [Rollup](https://rollupjs.org/guide/en/) that allows you to use Rollup to compile your Service Worker and have Workbox [inject a precache into it](https://developers.google.com/web/tools/workbox/guides/precache-files/cli). This differs from other Rollup/Workbox plugins in that Rollup controls the entire compiling/outputting process of the Service Worker instead of Workbox moving the file over and bypassing Rollup.

## Usage

### `rollup.config.js`

```js
const workbox = require('rollup-plugin-workbox-inject);

module.exports = {
  input: /*...*/,
  output: /*...*/,
  plugins: [
    workbox({
      swSrc: 'src/sw.js',
      swDest: 'public/sw.js',
      globDirectory: 'public'
      globPatterns: [
        'css/**/*.css',
        'js/**/*.js'
      ]
    })
  ]
}
```

- `swSrc` - The source file of the service worker. Workbox uses it to ensure it's not accidentally cached. You need to configure Rollup separately to compile this file.
- `swDest` - The destination file of the service worker. Workbox uses it to ensure it's not accidentally cached. You need to configure Rollup separately to output this file.
- `globDirectory` - The directory that the files being globbed exist in
- `globPatterns` - The patterns to glob and inject for precaching

### Service Worker

**Requires Workbox v5.0.0-rc.1 or greater!**

```js
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);
```
