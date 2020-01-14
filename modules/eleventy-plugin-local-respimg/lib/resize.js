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
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminWebP = require('imagemin-webp');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const gif2webp = require('imagemin-gif2webp');
const svgo = require('imagemin-svgo');
const gifResize = require('@gumlet/gif-resize');

const { ensureDirSync } = require('fs-extra');

const path = require('path');
const { writeFile } = require('fs').promises;

const { outputURL } = require('./helpers');

/**
 *
 * @param {number[]} sizes - An array of widths in px
 * @param {string} type - file extension
 * @param {string} src - image source URL
 * @param {buffer} buff - File buffer
 * @param {object} config - Config
 *
 * @return {Promise[]}
 */
async function resizeAndOptimize(sizes, type, src, buff, config) {
  switch (type.mime) {
    case 'image/gif': {
      return sizes.map(async size => {
        const c = config.images.gifresize || {};
        const output = await gifResize(Object.assign(c, { width: size }))(buff);
        const webp = await generateWebp(output, config);
        const outputDest = outputURL(src, size, type.ext, config.folders.output);
        const webpDest = outputURL(src, size, 'webp', config.folders.output);

        return [
          { dest: outputDest, buff: output },
          { dest: webpDest, buff: webp },
        ];
      });
    }
    case 'image/jpeg':
    case 'image/png': {
      return sizes.map(async size => {
        let output = await sharp(buff)
          .resize(size)
          .toBuffer();
        output = await imagemin.buffer(output, {
          plugins: [mozjpeg(config.images.mozjpeg || {}), pngquant(config.images.pngquant || {})],
        });
        const webp = await generateWebp(output, config);

        const outputDest = outputURL(src, size, type.ext, config.folders.output);
        const webpDest = outputURL(src, size, 'webp', config.folders.output);

        return [
          { dest: outputDest, buff: output },
          { dest: webpDest, buff: webp },
        ];
      });
    }
    case 'image/svg': {
      const output = await imagemin.buffer(buff, {
        plugins: [svgo(config.images.svgo || {})],
      });
      return [
        {
          dest: path.join(config.folders.output, src),
          buff: output,
        },
      ];
    }
    default: {
      return [
        {
          dest: path.join(config.folders.output, src),
          buff,
        },
      ];
    }
  }
}

/**
 *
 * @param {object} f - File to optimize
 * @param {buffer} f.buff - File buffer
 * @param {string} f.dest - Destination path
 * @param {object} config - Config
 *
 * @return {buffer<Promise>}
 */
async function optimizeAdditional(f, config) {
  ensureDirSync(path.dirname(f.dest));
  return writeFile(
    f.dest,
    await imagemin.buffer(f.buff, {
      destination: config.folders.output,
      plugins: [mozjpeg(config.images.mozjpeg || {}), pngquant(config.images.pngquant || {}), svgo(config.images.svgo || {})],
    }),
  );
}

/**
 *
 * @param {buffer} buff - Input buffer
 * @param {object} config - Config
 *
 * @return {buffer}
 */
function generateWebp(buff, config) {
  return imagemin.buffer(buff, {
    plugins: [imageminWebP(config.images.webp || {}), gif2webp(config.images.gifwebp || {})],
  });
}

module.exports = {
  resizeAndOptimize,
  optimizeAdditional,
  generateWebp,
};
