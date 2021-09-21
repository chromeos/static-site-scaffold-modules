const gifToVideo = require('./ffmpeg');
const renderSharpImages = require('./sharp');
const renderSquooshImages = require('./squoosh');

/**
 *
 * @param {SharpImages[]} images - Images
 * @param {Object} options
 * @param {Object} counter - Counter for totals
 */
module.exports = async function output(images, options, counter) {
  await Promise.all(
    images.map(async img => {
      // If the image is not a GIF, render it as a video
      if (img.format === 'gif') {
        return await gifToVideo(img, options, counter);
      } else if (options.optimizer === 'sharp') {
        return await renderSharpImages(img, options, counter);
      } else if (options.optimizer === 'squoosh') {
        return await renderSquooshImages(img, options, counter);
      }
    }),
  );

  return counter;
};
