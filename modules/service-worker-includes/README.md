# Service Worker Includes

Service Worker Inlcudes (SWIs) are a pattern for improving cache performance and correctness of service workers by caching infrequently changed portions of an HTML document, like a site's global header or footer, separately from the frequently changing portions, like the content. They are based on [Server Side Includes](https://en.wikipedia.org/wiki/Server_Side_Includes) and currently supports the `include` directive and the `virtual` parameter, and requires the include be part of the Service Worker precache. SWIs work by removing the static-rendered includes in served HTML before it enters the user's cache, and replacing the includes with their content when the HTML is served from cache. This allows content and certain components to be cached separately, allowing only a portion of a page's cached content to need to be invalidated when things like global components change.

In order to use SWIs, you need to wrap the include's rendered HTML in a start include comment, `<!--#include virtual="/path/from/root/to/component.txt"-->`, and and end include comment `<!--#endinclude-->`. This can be done fairly easily in most templating languages, with the following demo done using [Nunjucks' macro](https://mozilla.github.io/nunjucks/templating.html#macro) definitions. The navigation component (reproduced below from [static site scaffold](https://github.com/chromeos/static-site-scaffold/blob/master/templates/_components/nav.html)) does this to allow navigation to be included:

```handlebars
{% macro nav(locale, ssi = true) %} {% if ssi %}<!--#include virtual="/_components/{{locale}}/nav.txt"-->{% endif %}
<nav>
  <ul>
    <li><a href="/{{locale}}">Home</a></li>
    <li><a href="/{{locale}}/typography">Typography</a></li>
  </ul>
</nav>
{% if ssi %}<!--#endinclude-->{% endif %} {% endmacro %}

```

Then, use that macro as you normally would throughout your project. Remember to compile this template with `ssi = false` to `/_components/{{locale}}/nav.txt` and to precache it using your Service Worker in order to have it available to this script!

## Usage

Service Worker Includes is designed to work with service workers built with [Workbox](https://developers.google.com/web/tools/workbox) `5.0.0-rc.1` or greater. To use it, import it and include it as a plugin in your Workbox strategy, for instance here with a [Stale While Revalidate](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/#stale-while-revalidate) strategy:

```js
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { serviceWorkerIncludePlugin } from 'service-worker-includes';
import { registerRoute } from 'workbox-routing';

// Create a Stale While Revalidate strategy
const htmlCachingStrategy = new StaleWhileRevalidate({
  cacheName: 'pages-cache',
  plugins: [
    serviceWorkerIncludePlugin,
    new CacheableResponsePlugin({
      statuses: [200, 301, 404],
    }),
  ],
});

// Use it for navigations
registerRoute(({ request }) => request.mode === 'navigate', htmlCachingStrategy);
```

## Related

- [Rollup Plugin Workbox Inject](https://www.npmjs.com/package/rollup-plugin-workbox-inject) - Allow Workbox to inject precache into a Rollup compiled service worker
- [Service Worker i18n Redirects](https://www.npmjs.com/package/service-worker-i18n-redirect) - Redirect users to their preferred language from a Service Worker
