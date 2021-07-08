const replaceExt = require('replace-ext');
const chalk = require('chalk');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

/**
 * Transforms an input Gif into an MP4 video
 * @param {string} input - Input GIF path
 * @param {string} output - Output video path
 * @return {Promise}
 */
function gifToVideo(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions(['-movflags', 'faststart', '-filter:v', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', '-y'])
      .save(output)
      .on('end', resolve)
      .on('error', e => reject(e));
  });
}

/**
 *
 * @param {SharpImages[]} images - Images
 * @param {Object} config
 * @param {Object} command
 */
module.exports = async function output(images, config, command) {
  let total = 0;

  await Promise.all(
    images.map(async img => {
      // If the image is not a GIF, render it as a video
      if (img.format === 'gif') {
        const f = replaceExt(img.src, `.mp4`);
        const file = path.join(command.dirs.out, replaceExt(img.src, `.mp4`));
        config.logger.info(chalk.grey(`rendering ${f}`));
        total += 1;
        return await gifToVideo(path.join(command.dirs.root, img.src), file);
      }

      const f = replaceExt(img.src, `.[${img.sizes.join(',')}].[${img.formats.join(',')}]`);
      config.logger.info(chalk.grey(`rendering ${f}`));

      return await Promise.all(
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
            }),
          );
        }),
      );
    }),
  );

  return total;
};
