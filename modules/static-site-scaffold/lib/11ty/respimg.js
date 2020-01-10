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
const sharp = require('sharp');
const replaceExt = require('replace-ext');
const fileType = require('file-type');
const imageSize = require('image-size');

const imagemin = require('imagemin');
const imageminWebP = require('imagemin-webp');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const gif2webp = require('imagemin-gif2webp');
const svgo = require('imagemin-svgo');

const gifResize = require('@gumlet/gif-resize');

const glob = require('fast-glob');

const { readFileSync, ensureDirSync } = require('fs-extra');
const { writeFile } = require('fs').promises;
const path = require('path');

const imagemap = {};
let config = {};

/**
 *
 * @param {string} src
 * @param {number} size
 * @param {string} type
 *
 * @return {string}
 */
function outputURL(src, size, type) {
  return replaceExt(path.join(config.folders.output, src), `.${size}.${type}`);
}

/**
 *
 * @param {number[]} sizes - An array of widths in px
 * @param {string} type - file extension
 * @param {string} src - image source URL
 * @param {buffer} buff - File buffer
 *
 * @return {Promise[]}
 */
async function resizeAndOptimize(sizes, type, src, buff) {
  switch (type.mime) {
    case 'image/gif': {
      return sizes.map(async size => {
        const c = config.images.gifresize || {};
        const output = await gifResize(Object.assign(c, { width: size }))(buff);
        const webp = await generateWebp(output);
        const outputDest = outputURL(src, size, type.ext);
        const webpDest = outputURL(src, size, 'webp');

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
        const webp = await generateWebp(output);

        const outputDest = outputURL(src, size, type.ext);
        const webpDest = outputURL(src, size, 'webp');

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
 *
 * @return {buffer<Promise>}
 */
async function optimizeAdditional(f) {
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
 *
 * @return {buffer}
 */
function generateWebp(buff) {
  return imagemin.buffer(buff, {
    plugins: [imageminWebP(config.images.webp || {}), gif2webp(config.images.gifwebp || {})],
  });
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
 * @param {string} src - src attribute for image
 * @param {string} outputPath - Output path for HTML file
 *
 * @return {object} - {src: string, local: boolean}
 */
function determineImagePath(src, outputPath) {
  const local = !RegExp('^https?://').test(src);

  if (!local) {
    return {
      src,
      local,
    };
  }

  if (!path.isAbsolute(src)) {
    let base = path.dirname(outputPath);

    if (outputPath.startsWith(config.folders.output)) {
      base = base.slice(config.folders.output.length + 1);
    }

    return { src: path.join(base, src), local };
  }

  return { src, local };
}

/**
 *
 * @param {string} content
 * @param {string} outputPath
 */
async function respimg(content, outputPath) {
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

  await Promise.all(toOptimize.map(f => optimizeAdditional(f)));

  if (outputPath.endsWith('.html')) {
    const $ = cheerio.load(content);

    const images = $(':not(picture) img').get();
    // const pictures = $('picture img, picture source');

    // Optimize and make responsive images not already in an image tag
    if (images.length) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const { src, local } = determineImagePath($(image).attr('src'), outputPath);

        if (local) {
          const respSizes = $(image).attr('sizes') || config.images.sizes;
          $(image).removeAttr('sizes');

          const file = readFileSync(path.join(config.folders.source, src));
          ensureDirSync(path.join(config.folders.output, path.dirname(src)));

          const type = fileType(file);
          const size = imageSize(file);

          if (path.extname(src) === '.svg') {
            type.mime = 'image/svg';
            type.ext = 'svg';
          }

          const step = 150;
          const min = 250;
          const max = 1500;

          const genMax = max < size.width ? max : size.width;
          const sizes = [];

          if (min + step <= size.width) {
            for (let i = min; i < genMax; i += step) {
              sizes.push(i);
            }
          }

          sizes.push(genMax);

          // Set height, width, and lazy loading attributes
          $(image).attr('height', (genMax / size.width) * size.height);
          $(image).attr('width', genMax);
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
            await Promise.all((await Promise.all(await resizeAndOptimize(sizes, type, src, file))).flat().map(f => writeFile(f.dest, f.buff)));
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

      return $.html();
    }
  }

  return content;
}

module.exports = c => {
  config = c;
  return respimg;
};

module.exports.setup = (eleventy, c) => {
  config = c;
  eleventy.addTransform('respimg', respimg);
  if (eleventy.addWatchTarget && config.images.watch) {
    if (Array.isArray(config.images.watch.src)) {
      config.images.watch.src.map(p => eleventy.addWatchTarget(path.join(config.folders.source, p)));
    } else {
      eleventy.addWatchTarget(path.join(config.folders.source, config.images.watch.src));
    }
  }
};
