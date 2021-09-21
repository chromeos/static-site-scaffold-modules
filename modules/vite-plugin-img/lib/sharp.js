const replaceExt = require('replace-ext');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Outputs resized, optimized images using Sharp
 * @param {SharpImage} image - Input image
 * @param {object} options - Render options
 * @param {Object} counter - Counter object
 * @return {Promise}
 */
async function renderSharpImages(image, options, counter = {}) {
  const f = replaceExt(image.src, `.[${image.sizes.join(',')}].[${image.formats.join(',')}]`);
  options.logger.info(chalk.grey(`rendering ${f}`));

  return await Promise.all(
    image.sizes.reverse().map(async s => {
      const stream = image.sharp.clone().resize(s);
      await Promise.all(
        image.formats.map(async type => {
          counter.total += 1;
          const file = path.join(options.dirs.out, replaceExt(image.src, `.${s}.${type}`));
          let copy = stream.clone();
          counter[type] += 1;

          switch (type) {
            case 'avif':
              copy = copy.avif({});
              break;
            case 'webp':
              copy = copy.webp({});
              break;
            case 'png':
              copy = copy.png();
              break;
            case 'jpeg':
              copy = copy.jpeg({ progressive: true });
              break;
          }

          fs.ensureDirSync(path.dirname(file));
          await copy.toFile(file);
        }),
      );
    }),
  );
}

module.exports = renderSharpImages;
