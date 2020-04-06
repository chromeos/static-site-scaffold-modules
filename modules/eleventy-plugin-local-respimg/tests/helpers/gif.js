const ffmpeg = require('fluent-ffmpeg');

/**
 *
 * @param {string} src _Input source URL
 * @return {Promise}
 */
function getVideoMetadata(src) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(src, (err, metadata) => {
      if (err) return reject(err);

      return resolve(metadata);
    });
  });
}

module.exports = {
  getVideoMetadata,
};
