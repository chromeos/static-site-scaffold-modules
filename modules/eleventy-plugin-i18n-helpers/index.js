const ISO6391 = require('iso-639-1');
const path = require('path');
const filters = require('./lib/filters');

/**
 * Configuration object for Eleventy
 * @param {Eleventy} eleventy - Eleventy instance
 * @param {Object} config - Module's config object
 */
function configFunction(eleventy, config = {}) {
  eleventy.addFilter('date', filters.createDateFilter(config));
  eleventy.addFilter('localeURL', filters.createLocaleURLFilter(config));
  eleventy.addFilter('langName', filters.iso);

  // Allows for .json, .js, .yaml, and .yml files to be included in Eleventy watch for i18n data.
  if (config.pagesFolder) {
    eleventy.addWatchTarget(path.join(config.pagesFolder, `{${ISO6391.getAllCodes().join(',')}}`, '_data', '*.{json,js,yaml,yml}'));
  }
}

module.exports = {
  configFunction,
};
