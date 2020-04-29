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

const chalk = require('chalk');
const defaults = require('workbox-build/build/options/defaults');
const getFileManifestEntries = require('workbox-build/build/lib/get-file-manifest-entries');
const getManifestSchema = require('workbox-build/build/options/schema/get-manifest');
const prettyBytes = require('pretty-bytes');
const rebasePath = require('workbox-build/build/lib/rebase-path');
const replaceAndUpdateSourceMap = require('workbox-build/build/lib/replace-and-update-source-map');
const stringify = require('fast-json-stable-stringify');
const upath = require('upath');
const validate = require('workbox-build/build/lib/validate-options');

/**
 * Rollup plugin to inject Workbox precaching information in-line
 *
 * @param {object} config - A configuration object
 * @return {RollupPlugin}
 */
function workboxInject(config) {
  return {
    name: 'workbox-inject', // this name will show up in warnings and errors
    async generateBundle(outputOptions, bundle) {
      // injectionPoint isn't supported by getManifestSchema, but we need it.
      const injectionPoint = config.injectionPoint || defaults.injectionPoint;
      delete config.injectionPoint;

      const options = validate(config, getManifestSchema);

      // globDirectory might not be set, as developers can just provide
      // additionalManifestEntries and forgo globbing.
      if (options.globDirectory) {
        const outputDir = outputOptions.dir ||
          upath.dirname(upath.resolve(outputOptions.file));

        // Make sure we leave the source service worker and any output of this
        // specific Rollup compilation out of the precache manifest.
        for (const chunk of Object.values(bundle)) {
          const fileRebasedToGlobDirectory = rebasePath({
            file: upath.resolve(outputDir, chunk.fileName),
            baseDirectory: options.globDirectory,
          });
          // Sourcemaps might be disabled, but adding something extra to
          // globIgnores doesn't hurt.
          const mapFile = `${fileRebasedToGlobDirectory}.map`;

          options.globIgnores.push(
            fileRebasedToGlobDirectory,
            mapFile,
          );

          // If set, this should be the path to the original source module.
          if (chunk.facadeModuleId) {
            const moduleRebasedToGlobDirectory = rebasePath({
              file: chunk.facadeModuleId,
              baseDirectory: options.globDirectory,
            });
            options.globIgnores.push(moduleRebasedToGlobDirectory);
          }
        }
      }

      const { manifestEntries, count, warnings, size } = await getFileManifestEntries(options);

      const manifestString = stringify(manifestEntries);

      let noInjectionPointFound = true;
      for (const chunk of Object.values(bundle)) {
        // This might actually be an asset (which won't have a code property)
        // and not a chunk. If so, continue.
        if (!chunk.code) {
          continue;
        }

        if (chunk.code.includes(injectionPoint)) {
          noInjectionPointFound = false;
          if (chunk.map) {
            const { map, source } = await replaceAndUpdateSourceMap({
              originalMap: chunk.map,
              jsFilename: chunk.fileName,
              originalSource: chunk.code,
              replaceString: manifestString,
              searchString: injectionPoint,
            });
            chunk.code = source;
            chunk.map = map;
          } else {
            chunk.code = chunk.code.replace(injectionPoint, manifestString);
          }

          const warn = `\nThere ${warnings.length > 1 ? 'were' : 'was'} ${chalk.red(warnings.length)} ${warnings.length > 1 ? 'warnings' : 'warning'}.`;
          console.log(`Injected ${chalk.cyan(count + ' files')} for precaching, ${chalk.cyan(prettyBytes(size))} total, into ${chalk.cyan(chunk.fileName)}.${warnings.length ? warn : ''}`);
          if (warnings.length) {
            warnings.forEach(w => console.warn(w));
          }
        }
      }

      if (noInjectionPointFound) {
        throw new Error(`Unable to find a place to inject the precache ` +
          `manifest. Please ensure your service worker contains ` +
          `"${injectionPoint}" somewhere in its code.`);
      }
    },
  };
}

module.exports = workboxInject;
