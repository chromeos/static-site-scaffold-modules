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
const cheerio = require('cheerio');
const FileType = require('file-type');
const imageSize = require('image-size');
const glob = require('fast-glob');
const merge = require('merge-deep');

const { readFileSync, ensureDirSync } = require('fs-extra');
const { writeFile } = require('fs').promises;
const path = require('path');

const { guessLength, generateSrcset, determineImagePath } = require('./helpers');
const { resizeAndOptimize, optimizeAdditional, generateVideo } = require('./resize');

const imagemap = {};

const baseConfig = {
  folders: {
    source: 'src',
    output: 'dest',
  },
  images: {
    resize: {
      min: 250,
      max: 1500,
      step: 150,
    },
    gifToVideo: false,
    sizes: '100vw',
    lazy: true,
    additional: [],
    watch: {
      src: 'images/**/*',
      dest: 'images/**/*',
    },
  },
};

/**
 * @param {object} userConfig - Configuration
 * @return {function}
 */
function respimgSetup(userConfig = {}) {
  /**
   * @param {string} content
   * @param {string} outputPath
   */

  const config = merge(baseConfig, userConfig);

  return async function respimg(content, outputPath) {
    // Move Additional Over
    const toOptimize = [];

    (await glob(config.images.additional.map(i => path.join(config.folders.source, i)))).forEach(pth => {
      const f = {
        src: pth,
        buff: readFileSync(pth),
      };

      const src = f.src.slice(config.folders.source.length + 1);
      if (Object.keys(imagemap).includes(src)) {
        if (!imagemap[src].buff.equals(f.buff)) {
          toOptimize.push({
            dest: path.join(config.folders.output, src),
            buff: f.buff,
          });
          imagemap[src] = { buff: f.buff };
        }
      } else {
        toOptimize.push({
          dest: path.join(config.folders.output, src),
          buff: f.buff,
        });
        imagemap[src] = { buff: f.buff };
      }
    });

    await Promise.all(toOptimize.map(f => optimizeAdditional(f, config)));

    if (outputPath.endsWith('.html')) {
      const $ = cheerio.load(content);

      const images = $(':not(picture) img').get();
      // const pictures = $('picture img, picture source');

      // Optimize and make responsive images not already in an image tag
      if (images.length) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const { src, local } = determineImagePath($(image).attr('src'), outputPath, config.folders.output);

          if (local) {
            const respSizes = $(image).attr('sizes') || config.images.sizes;
            $(image).removeAttr('sizes');

            const file = readFileSync(path.join(config.folders.source, src));
            ensureDirSync(path.join(config.folders.output, path.dirname(src)));

            const type = await FileType.fromBuffer(file);
            const size = imageSize(file);

            if (config.images.gifToVideo && type.mime === 'image/gif') {
              await generateVideo(src, config);
              const video = `<video src="${generateSrcset(['xform'], src, 'mp4').slice(0, -7)}" type="video/mp4" autoplay loop muted playsinline controls height="${size.height}" width="${size.width}">${$(image).attr('alt')}</video>`;
              $(image).replaceWith(video);
            } else {
              if (path.extname(src) === '.svg') {
                type.mime = 'image/svg';
                type.ext = 'svg';
              }

              const step = config.images.resize.step;
              const min = config.images.resize.min;
              const max = config.images.resize.max;

              const genMax = max < size.width ? max : size.width;
              const sizes = [];

              if (min <= size.width) {
                for (let i = min; i < genMax; i += step) {
                  sizes.push(i);
                }
              }

              sizes.push(genMax);

              // Set height, width, and lazy loading attributes
              const height = (genMax / size.width) * size.height;
              const width = genMax;
              $(image).attr('height', height);
              $(image).attr('width', width);
              if (config.images.lazy) {
                $(image).attr('loading', 'lazy');
              }

              let optimize = true;
              if (Object.keys(imagemap).includes(src)) {
                optimize = !imagemap[src].buff.equals(file);
              } else {
                imagemap[src] = {
                  buff: file,
                  length: guessLength(sizes, type.mime),
                };
              }

              if (optimize) {
                await Promise.all((await Promise.all(await resizeAndOptimize(sizes, type, src, file, config))).flat().map(f => writeFile(f.dest, f.buff)));
              }

              if (imagemap[src].length > 1) {
                const baseSrcset = generateSrcset(sizes, src, type.ext);
                const webpSrcset = generateSrcset(sizes, src, 'webp');

                const imgHTML = $.html(image);
                let img = `<picture>`;
                img += `<source srcset="${webpSrcset}" sizes="${respSizes}" type="image/webp">`;
                img += `<source srcset="${baseSrcset}" sizes="${respSizes}" type="${type.mime}">`;
                img += `${imgHTML}</picture>`;
                $(image).replaceWith(img);
              }
            }
          }
        }

        const hasBody = /<\s*body(\w|\s|=|"|-)*>/gm;

        if (hasBody.test(content)) {
          return $.html();
        }

        return $('body').html();
      }
    }

    return content;
  };
}

module.exports = respimgSetup;
