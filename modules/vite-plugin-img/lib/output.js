const replaceExt = require('replace-ext');
const chalk = require('chalk');
const path = require('path');

/**
 *
 * @param {SharpImages[]} images - Images
 * @param {Object} config
 * @param {Object} command
 */
module.exports = async function output(images, config, command) {
  let total = 0;

  await Promise.all(
    images.map(async img =>
      Promise.all(
        img.sizes.reverse().map(async s => {
          const stream = img.sharp.clone().resize(s);
          await Promise.all(
            img.formats.map(async type => {
              total += 1;
              const file = path.join(command.dirs.out, replaceExt(img.src, `.${s}.${type}`));
              let copy = stream.clone();
              switch (type) {
                case 'avif':
                  copy = copy.avif({ lossless: true });
                  break;
                case 'webp':
                  copy = copy.webp({ lossless: true });
                  break;
                case 'png':
                  copy = copy.png();
                  break;
                case 'jpeg':
                  copy = copy.jpeg({ progressive: true });
                  break;
              }

              await copy.toFile(file);
              config.logger.info(chalk.grey(`rendering ${file.replace(command.dirs.out, '').substring(1)}`));
            }),
          );
        }),
      ),
    ),
  );

  return total;
};
