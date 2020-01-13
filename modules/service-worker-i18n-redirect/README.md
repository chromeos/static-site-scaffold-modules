# Service Worker Internationalization Redirect

Service Worker Internationalization Redirect (i18nR) provides logic to redirect a request based on the URL prefix pattern often found in internationalized URLs; for instance `en/contact` for the English version of a Contact URL and `es/contact` for the Spanish version of that same page.

## Requirements

The only requirement for this to work properly is the structure of URLs to be the following: `{{langcode}}/url/piece`. This means that the only part of a URL that should be different for different languages is `{{langcode}}`; if other parts of the URL are different this redirection won't work.

In addition to the URL, an object that includes a `get` property with the following signature is needed to pass into the handler, and the preferred language needs to be available at the `'lang'` key:

```js
class PreferenceStore {
  constructor() {
    this.store = {};
  }

  async get(key) {
    return this.store[key];
  }
}
```

This module makes available a class that can be used, backed by [idb-keyval](https://www.npmjs.com/package/idb-keyval), that can be used for this, includes both a `get` and `set` method, and can be used in both the main thread and in the Service Worker. Importing it via `import { preferences } from 'service-worker-i18n-redirect/preferences';` makes it available.

## Usage

Service Worker Internationalization Redirect is designed to work with service workers built with [Workbox](https://developers.google.com/web/tools/workbox) `5.0.0-rc.1` or greater. To use it, import it and use it as a handler for your route:

```js
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { i18nHandler } from 'service-worker-i18n-redirect';
import { preferences } from 'service-worker-i18n-redirect/preferences';
import { registerRoute } from 'workbox-routing';

// Create a caching strategy
const htmlCachingStrategy = new StaleWhileRevalidate({
  cacheName: 'pages-cache',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [200, 301, 404],
    }),
  ],
});

// Create an array of languages
const languages = ['en', 'es', 'fr', 'de', 'ko'];

// Use it for navigations
registerRoute(({ request }) => request.mode === 'navigate', i18nHandler(languages, preferences, htmlCachingStrategy));
```

To prevent a redirect, append `?locale_redirect=false` to a URL.

## Related

- [Rollup Plugin Workbox Inject](https://www.npmjs.com/package/rollup-plugin-workbox-inject) - Allow Workbox to inject precache into a Rollup compiled service worker
- [Service Worker Includes](https://www.npmjs.com/package/service-worker-includes) - Caching Strategy plugin for including content when served from a Service Worker and differentially caching dynamic and static pieces of an HTML response.
