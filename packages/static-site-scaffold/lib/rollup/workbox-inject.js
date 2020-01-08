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
const escapeRegexp = require('workbox-build/src/lib/escape-regexp');
const getFileManifestEntries = require('workbox-build/src/lib/get-file-manifest-entries');
const injectManifestSchema = require('workbox-build/src/options/schema/inject-manifest');
const rebasePath = require('workbox-build/src/lib/rebase-path');
const validate = require('workbox-build/src/lib/validate-options');
const replaceAndUpdateSourceMap = require('workbox-build/src/lib/replace-and-update-source-map');
const stringify = require('fast-json-stable-stringify');
const chalk = require('chalk');

/**
 * Rollup plugin to inject Workbox precaching information in-line
 *
 * @param {object} config - A configuration object
 * @return {RollupPlugin}
 */
function workboxInject(config) {
  return {
    name: 'workbox-inject', // this name will show up in warnings and errors
    async generateBundle(opts, bundle) {
      const options = validate(config, injectManifestSchema);
      // Make sure we leave swSrc and swDest out of the precache manifest.
      for (const file of [options.swSrc, options.swDest]) {
        options.globIgnores.push(
          rebasePath({
            file,
            baseDirectory: options.globDirectory,
          }),
        );
      }
      const globalRegexp = new RegExp(escapeRegexp(options.injectionPoint), 'g');

      const { manifestEntries, count, warnings, size } = await getFileManifestEntries(options);

      const manifestString = stringify(manifestEntries);

      const bundles = Object.keys(bundle);

      while (bundles.length) {
        const bndl = bundle[bundles.pop()];
        if (bndl.code.match(globalRegexp)) {
          const { map, source } = await replaceAndUpdateSourceMap({
            originalMap: bndl.map,
            jsFilename: bndl.fileName,
            originalSource: bndl.code,
            replaceString: manifestString,
            searchString: options.injectionPoint,
          });
          bndl.code = source;
          bndl.map = map;
          const warn = `\nThere ${warnings.length > 1 ? 'were' : 'was'} ${chalk.red(warnings.length)} ${warnings.length > 1 ? 'warnings' : 'warning'}.`;
          console.log(`Injected ${chalk.cyan(count + ' files')} for precaching, ${chalk.cyan(size * 0.001 + ' KB')} total, into ${chalk.cyan(bndl.fileName)}.${warnings.length ? warn : ''}`);
          if (warnings.length) {
            warnings.forEach(w => console.warn(w));
          }
        }
      }
    },
  };
}

module.exports = workboxInject;
