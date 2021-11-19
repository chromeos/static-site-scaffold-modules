# Eleventy Plugin i18n Helpers

Internationalization helpers for [11ty](https://www.11ty.dev/), including filters and data cascade for localization.

## Filters

This plugin comes with three filters, `date`, `localeURL`, and `langName`.

### Date

Formats a date using [`Date.toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString).

**Usage, default**

```
{{'January 1, 2022' | date}}
```

**Usage, advanced**

```
{{'January 1, 2022' | date('es', {weekday: 'long'})}}
```

**Options**

- `defaultLocale` - Default locale to use for formatting. Defaults to `en-US`. Shared with `localeURL` filter.
- `defaultFormat` - Default formatting options to use. Defaults to `{}`;

### localeURL

Formats an locale-specific path `/en/foo/bar` and updates it to use the provided locale. Accepts either URL objects or strings in the form of a URL pathname.

**Usage**

```
{{ '/en/foo/bar' | localeURL('es')}}
```

**Options**

- `defaultLocale` - Default locale to use for formatting. Defaults to `en-US`. Shared with `date` filter.

### ISO

Exposes the [`iso-639-1`](https://www.npmjs.com/package/iso-639-1) module, allowing you to access information about countries like their names, languages, codes, and validate country codes. To use, pass in the method you want to the filter.

**Sample Usage**

```
{{'en-US' | iso('getName')}}
```

## Locale Data Cascade

At the root of a language folder, add an `11tydata.js` file named the same as the language folder's language, and add the following, with the second argument being the fallback language if data isn't available:

```js
const localeDataCascade = require('eleventy-plugin-i18n-helpers/locale-data-cascade');

module.exports = function() {
  return localeDataCascade(__dirname, 'en');
};
```

This will allow data to cascade from one language to another, making sure all data properties are always available. Then, include the `pagesFolder` option in the plugin config where your language folders exist.

In each language folder, add a `_data` folder. Place your data in that folder! Each file in that folder can be a `.json`, `.js`, `.yaml`, or `.yml` file, with the filename becoming the data key and the exported values being sub-keys, so a file named `name.yml` and a property named `first` would be available in 11ty as `name.first`. When any of those files are changed, 11ty will rebuild and update your data.
