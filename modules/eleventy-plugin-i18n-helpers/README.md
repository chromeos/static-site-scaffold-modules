# Eleventy Plugin i18n Helpers

Internationalization helpers for [11ty](https://www.11ty.dev/), including filters and data cascade for localized content.

## Filters

This plugin comes with three filters, `date`, `localeURL`, and `langName`.

### Date

Formats a date using [`Date.toLocaleDateString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString). May require including [`full-icu`](https://www.npmjs.com/package/full-icu) in your project; the filter will detect if it's needed and throw an error if it is.

**Usage, default**

```html
{{'January 1, 2022' | date}}
<!-- 1/1/2022 -->
```

**Usage, advanced**

```html
{{'January 1, 2022' | date('es', {weekday: 'long'})}}
<!-- sábado -->
```

**Options**

- `defaultLocale` - Default locale to use for formatting. Defaults to `en-US`. Shared with `localeURL` filter.
- `defaultFormat` - Default formatting options to use. Defaults to `{}`;

### localeURL

Formats an locale-specific path `/en/foo/bar` and updates it to use the provided locale. Accepts either URL objects or strings in the form of a URL pathname.

**Usage**

```html
{{ '/en/foo/bar' | localeURL('es')}}
<!-- /es/foo/bar -->
```

**Options**

- `defaultLocale` - Default locale to use for formatting. Defaults to `en-US`. Shared with `date` filter.

### ISO

Exposes the [`iso-639-1`](https://www.npmjs.com/package/iso-639-1) module, allowing you to access information about countries like their names, languages, codes, and validate country codes. To use, pass in the method you want to the filter.

**Sample Usage**

```html
{{'de' | iso('getName')}}
<!-- German -->
```

## Data Fallback

The Data Fallback helper is advanced functionality to allow data from one folder to fall back to another, for instance a localization's data to fall back to the site default language's data. This allows data changes, like localization, to be done progressively without requiring additional logic or complexity in your templating to ensure the data objects you expect to be available are, in fact, there. As an added bonus, it allows data for data to be stored across multiple files and in JSON, JS, or YAML format, making it easier to maintain.

This function requires a (somewhat) specific folder structure, as follows:

```
|- content root
  |- folder-1
    |- folder-1.11tydata.js
    |- _data
      |- my-data.{json|js|yml|yaml}
  |- folder-2
    |- folder-2.11tydata.js
    |- _data
      |- my-data.{json|js|yml|yaml}
```

All localized content, including your default language, if you have one, should be stored inside a "content root" folder (the actual folder name is irrelevant, it could be your project root, it could be another folder, it just matters that all related folders are stored _together_). Inside each folder, you need to include an [`11tydata.js`](https://www.11ty.dev/docs/data-js/) file, named the same thing as the folder it's in, which would look something like this for `folder-2`:

```js
// folder-2.11tydata.js
const dataFallback = require('eleventy-plugin-i18n-helpers/data-fallback');

module.exports = function() {
  return dataFallback('folder-1');
};
```

You also need to include a `_data` folder; place your data in there! Each file in that folder can be a `.json`, `.js`, `.yaml`, or `.yml` file, with the filename becoming the data key and the exported values being sub-keys, so a file named `name.yml` and a property named `first` would be available in 11ty as `name.first`. When any of those files are changed, 11ty will rebuild and update your data.

The fallback works by finding all of data files in a folder's `_data` folder and comparing it with the files in the fallback's `_data` folder. Any files present in the fallback but not in the original folder will be used to build the original folder's data object.

Once this is set up, you also need to pass the `contentRoot` option to the plugin, set to the path of your content root. You can also optionally pass in a `fallbackFolders` option, which is an array of folder names to watch for changes to. It defaults to all ISO6391 country codes.

### Example

As an example for how to set this up for localization, you may have a folder structure as follows:

**Folders**

```
|- pages
  |- de
    |- de.11tydata.js
    |- _data
      |- home.json
      |- menu.yaml
  |- en
    |- en.11tydata.js
    |- _data
      |- home.json
  |- es
    |- es.11tydata.js
    |- _data
      |- menu.yaml
```

**en.11tydata.js**

```js
const dataFallback = require('eleventy-plugin-i18n-helpers/data-fallback');

module.exports = function() {
  return dataFallback('de');
};
```
