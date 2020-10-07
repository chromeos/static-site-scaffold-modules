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
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
        if (process.env.NODE_ENV === 'production') {
          output = await imagemin.buffer(output, {
            plugins: [mozjpeg(config.images.mozjpeg || {}), pngquant(config.images.pngquant || {})],
          });
        }

        const webp = await generateWebp(output, config);
				const avif = await generateAvif(output, config);
        const outputDest = outputURL(src, size, type.ext, config.folders.output);
        const webpDest = outputURL(src, size, 'webp', config.folders.output);
	      const avifDest = outputURL(src, size, 'avif', config.folders.output);

        return [
          { dest: outputDest, buff: output },
          { dest: webpDest, buff: webp },
	        { dest: avifDest, buff: avif },
        ];
      });
    }
    case 'image/svg': {
      if (process.env.NODE_ENV === 'production') {
        const output = await imagemin.buffer(buff, {
          plugins: [svgo(config.images.svgo || {})],
        });
        return [
          {
            dest: path.join(config.folders.output, src),
            buff: output,
          },
        ];
      } else {
        return [
          {
            dest: path.join(config.folders.output, src),
            buff,
          },
        ];
      }
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

  let output = f.buff;

  if (process.env.NODE_ENV === 'production') {
    output = await imagemin.buffer(f.buff, {
      destination: config.folders.output,
      plugins: [mozjpeg(config.images.mozjpeg || {}), pngquant(config.images.pngquant || {}), svgo(config.images.svgo || {})],
    });
  }

  return writeFile(f.dest, output);
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

/**
 *
 * @param {buffer} buff - Input buffer
 * @param {object} config - Config
 *
 * @return {buffer}
 */
function generateAvif(buff, config) {
	return sharp(buff)
		.heif(config.images.avif)
		.toBuffer();
}

/**
 *
 * @param {string} src
 * @param {object} config
 * @return {Promise}
 */
async function generateVideo(src, config) {
  const output = outputURL(src, 'xform', 'mp4', config.folders.output);
  const input = path.join(config.folders.source, src);
  const command = `ffmpeg -i ${input} -movflags faststart -filter:v "scale=trunc(iw/2)*2:trunc(ih/2)*2" -pix_fmt yuv420p -y -loglevel error ${output}`;

  const { stderr } = await exec(command);

  if (stderr) {
    return Promise.reject(stderr);
  }

  return output;
}

module.exports = {
  resizeAndOptimize,
  optimizeAdditional,
  generateVideo,
  generateWebp,
};
