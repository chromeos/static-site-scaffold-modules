const postHTMLImg = require('./lib/posthtml-img');
const posthtml = require('posthtml');
const replaceExt = require('replace-ext');
const chalk = require('chalk');
const { PerformanceObserver, performance } = require('perf_hooks');
const path = require('path');

/**
 *
 * @param {Object} opts - options
 * @return {Object}
 */
const imgPlugin = (opts = {}) => {
  const images = [];
  let config = {};
  const options = opts;
  let command = {};

  const observer = new PerformanceObserver((items) => {
    const entries = items.getEntries();
    const total = entries.find((i) => i.name.startsWith('vite-plugin-img-duration'));
    if (total?.duration > 250) {
      const items = total.name.split(':')[1];
      config.logger.info(
        chalk.green(
          `Wrote ${items} images in ${(total.duration * 0.001).toFixed(2)}s (${Math.round(
            total.duration / items,
          )}ms each)`,
        ),
      );
    }

    performance.clearMarks();
  });

  observer.observe({ entryTypes: ['measure'], type: 'measure' });

  return {
    name: 'image',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      command = {
        build: config.command === 'build',
        dirs: {
          root: config.publicDir,
          out: path.join(config.root, config.build.outDir),
          cache: path.join(config.cacheDir, 'images'),
        },
        externalPrefix: '@fs',
      };
    },

    async transformIndexHtml(input) {
      performance.mark('vite-plugin-img-start');
      const { html } = await posthtml([postHTMLImg(images, command, options)]).process(input, {
        sync: false,
      });
      return html;
    },

    async closeBundle() {
      let total = 0;
      const { unique } = images.flat().reduce(
        (acc, img) => {
          if (!acc.ids.includes(img.src) && img.format !== 'gif' && img.format !== 'svg') {
            acc.ids.push(img.src);
            acc.unique.push(img);
          }

          return acc;
        },
        {
          unique: [],
          ids: [],
        },
      );

      await Promise.all(
        unique.map(async (img) =>
          Promise.all(
            img.sizes.reverse().map(async (s) => {
              const stream = img.sharp.clone().resize(s);
              await Promise.all(
                img.formats.map(async (type) => {
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
                  config.logger.info(
                    `${chalk.grey(chalk.white.dim(config.build.outDir + '/'))}${chalk.green(
                      file.replace(command.dirs.out, '').substring(1),
                    )}`,
                  );
                }),
              );
            }),
          ),
        ),
      );

      performance.measure(`vite-plugin-img-duration:${total}`, 'vite-plugin-img-start');
    },
  };
};

module.exports = { imgPlugin };
