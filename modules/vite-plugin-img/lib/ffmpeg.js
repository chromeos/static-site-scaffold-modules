const replaceExt = require('replace-ext');
const ffmpeg = require('fluent-ffmpeg');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Transforms an input Gif into an MP4 video
 * @param {SharpImage} image - Input image information
 * @param {object} options - Render options
 * @param {Object} counter - Counter object
 * @return {Promise}
 */
function gifToVideo(image, options, counter) {
  const f = replaceExt(image.src, `.mp4`);
  const output = path.join(options.dirs.out, replaceExt(image.src, `.mp4`));
  const input = path.join(options.dirs.root, image.src);
  options.logger.info(chalk.grey(`rendering ${f}`));

  const outDir = path.dirname(output);
  fs.ensureDirSync(outDir);
  counter.total += 1;
  counter.mp4 += 1;

  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions(['-movflags', 'faststart', '-filter:v', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', '-y'])
      .save(output)
      .on('end', resolve)
      .on('error', e => reject(e));
  });
}

module.exports = gifToVideo;
