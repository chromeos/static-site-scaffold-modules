const replaceExt = require('replace-ext');
const { ImagePool } = require('@squoosh/lib');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

const encodings = {
  jpeg: 'mozjpeg',
  webp: 'webp',
  avif: 'avif',
  png: 'oxipng',
};

/**
 * Outputs resized, optimized images using Sharp
 * @param {SharpImage} image - Input image
 * @param {object} options - Render options
 * @param {Object} counter - Counter object
 * @return {Promise}
 */
async function renderSquooshImages(image, options, counter = {}) {
  const f = replaceExt(image.src, `.[${image.sizes.join(',')}].[${image.formats.join(',')}]`);
  options.logger.info(chalk.grey(`rendering ${f}`));
  const imagePool = new ImagePool();

  const buff = await image.sharp.toBuffer();

  const building = await Promise.all(
    image.sizes.map(async size => {
      const preprocess = {
        resize: {
          enabled: true,
          width: size,
        },
      };
      const img = imagePool.ingestImage(buff);
      await img.preprocess(preprocess);
      const encode = image.formats
        .map(f => encodings[f])
        .reduce((acc, curr) => {
          acc[curr] = {};
          return acc;
        }, {});

      await img.encode(encode);

      return await Promise.all(
        image.formats.map(async format => {
          const e = encodings[format];
          const built = await img.encodedWith[e];
          const p = path.join(options.dirs.out, replaceExt(image.src, `.${size}.${format}`));
          counter.total += 1;
          counter[format] += 1;
          return await fs.outputFile(p, built.binary);
        }),
      );
    }),
  );

  await imagePool.close();
  return building;
}

module.exports = renderSquooshImages;
