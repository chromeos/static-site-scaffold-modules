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
const replaceExt = require('replace-ext');
const path = require('path');

/**
 *
 * @param {string} src
 * @param {number} size
 * @param {string} type
 * @param {string} outputFolder
 *
 * @return {string}
 */
function outputURL(src, size, type, outputFolder) {
  return replaceExt(path.join(outputFolder, src), `.${size}.${type}`);
}

/**
 *
 * @param {number[]} sizes - Array of widths in px
 * @param {string} type - File mime type
 *
 * @return {number}
 */
function guessLength(sizes, type) {
  switch (type) {
    case 'image/gif':
    case 'image/jpeg':
    case 'image/png': {
      return sizes.length * 2;
    }
    default: {
      return 1;
    }
  }
}

/**
 *
 * @param {number[]} sizes - Array of widths in px
 * @param {string} src - image source url
 * @param {string} type - file extension
 *
 * @return {string[]}
 */
function generateSrcset(sizes, src, type) {
  return sizes.map(s => `${replaceExt(src, `.${s}.${type}`)} ${s}w`).join(', ');
}

/**
 *
 * @param {string} src - src attribute for image
 * @param {string} outputPath - Output path for HTML file
 * @param {string} outputFolder
 *
 * @return {object} - {src: string, local: boolean}
 */
function determineImagePath(src, outputPath, outputFolder) {
  const local = !RegExp('^https?://').test(src);

  if (!local) {
    return {
      src,
      local,
    };
  }

  if (!path.isAbsolute(src)) {
    let base = path.dirname(outputPath);

    if (outputPath.startsWith(outputFolder)) {
      base = base.slice(outputFolder.length + 1);
    }

    return { src: path.join(base, src), local };
  }

  return { src, local };
}

module.exports = {
  guessLength,
  generateSrcset,
  outputURL,
  determineImagePath,
};
