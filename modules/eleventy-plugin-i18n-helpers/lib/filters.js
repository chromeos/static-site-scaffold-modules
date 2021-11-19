/**
 * Copyright 2021 Google LLC
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
const icu = require('full-icu');
const path = require('path');

/**
 *
 * @param {Object} param0 - Object containing the following properties:
 * @param {String} param0.defaultLocale - Locale to format for
 * @param {Object} param0.defaultFormat - Default date formatting
 * @return {function} Date filter function
 */
function createDateFilter({ defaultLocale, defaultFormat }) {
  if (icu.icu_small === true && process.env.NODE_ICU_DATA === undefined) {
    const err = `The current version of Node was not compiled with full ICU support. Please install the 'full-icu' module, make sure it successfully installs ICU data, and include the following environment variable when running Node: 'NODE_ICU_DATA=${path.relative(process.cwd(), icu.datPath())}'`;
    throw new Error(err);
  }
  /**
   * Formats a date for a specific locale
   * @param {Date} date - Date to format
   * @param {String} locale - Locale to format for
   * @param {Object} format - Format options
   * @return {String} Formatted date
   */
  return function date(date, locale = defaultLocale || 'en-US', format = defaultFormat || {}) {
    return new Date(date).toLocaleDateString(locale, format);
  };
}

/**
 *
 * @param {Object} param0 - Object containing the following properties:
 * @param {Object} param0.defaultFormat - Default date formatting
 * @return {function} Date filter function
 */
function createLocaleURLFilter({ defaultLocale }) {
  /**
   *  Formats a URL for a specific locale
   * @param {String|URL} url - URL to format. Should either be an absolute path (as the `.pathname` parameter of a URL) or a full URL
   * @param {String} locale - Locale to format for
   * @return {String|URL} Formatted URL, either a full URL if one was passed in, or the absolute .pathname
   */
  return function localeURL(url, locale = defaultLocale || 'en-US') {
    let isURL = false;
    let pth = url;
    if (url instanceof URL) {
      isURL = true;
      pth = url.pathname;
    }

    const changed = url.split('/');
    if (changed[changed.length - 1] === '') {
      changed.splice(-1, 1);
    }
    changed.splice(1, 1, locale);

    pth = changed.join('/');

    if (isURL) {
      url.pathname = pth;
      return url;
    }

    return pth;
  };
}

/**
 * Get ISO information for a country/code
 * @param {String|String[]} input - Country code or array of country codes
 * @param {String} method - ISO method to query
 * @return {string}
 */
function iso(input, method) {
  return ISO6391[method](input);
}

module.exports = {
  createDateFilter,
  createLocaleURLFilter,
  iso,
};
