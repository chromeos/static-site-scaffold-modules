/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ISO6391 = require('iso-639-1');

module.exports = eleventy => {
  // Transforms given date string into local date string
  //  Requires full-icu and NODE_ICU_DATA=node_modules/full-icu to function
  eleventy.addFilter('date', (date, locale = 'en-US', format = {}) => new Date(date).toLocaleDateString(locale, format));

  // Transforms given URL into a URL for the given locale
  eleventy.addFilter('localeURL', (url, locale) => {
    const changed = url.split('/');
    if (changed[changed.length - 1] === '') {
      changed.splice(-1, 1);
    }
    changed.splice(1, 1, locale);
    return changed.join('/');
  });

  // Returns the native name for the language code
  eleventy.addFilter('langName', code => ISO6391.getNativeName(code));
};
