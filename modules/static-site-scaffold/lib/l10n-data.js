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
const yaml = require('js-yaml');
const { readdirSync, readFileSync } = require('fs');
const { basename, extname, join } = require('path');

/**
 * Builds locale data files from JSON files in the language's `_data` directory
 *
 * @param {string} dirname - Path to start search from
 * @return {object}
 */
function getLocalData(dirname, fallback = 'en') {
  const config = {};

  // Get data directory from passed-in directory
  const dataPath = join(dirname, '_data');
  const fallbackPath = join(dirname, '..', fallback, '_data');

  // Find all files in directory
  const files = readdirSync(dataPath);
  // Finds all files in English language directory (as the default language is English for this site)
  const enFiles = readdirSync(fallbackPath);
  // Determines what files are present in the English language directory that aren't in the locale directory
  const diff = enFiles.filter(file => !files.includes(file));

  // Builds array of data files from the files in the locale data directory and the files in the english directory. These will be full file paths.
  const data = files.map(file => join(dataPath, file)).concat(diff.map(file => join(fallbackPath, file)));

  // Loops over each file, finds its file name w/o extension, and uses it to set a property on `config` to the contents of the file
  data.forEach(file => {
    const ext = extname(file);
    const name = basename(file, ext);

    if (ext === '.yaml' || ext === '.yml') {
      config[name] = yaml.safeLoad(readFileSync(file, 'utf-8'));
    } else if (ext === '.json') {
      config[name] = require(file);
    }
  });

  return config;
}

module.exports = getLocalData;
