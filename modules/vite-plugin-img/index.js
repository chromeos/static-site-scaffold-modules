const postHTMLImg = require('./lib/posthtml-img');
const output = require('./lib/output');
const posthtml = require('posthtml');
const chalk = require('chalk');
const { PerformanceObserver, performance } = require('perf_hooks');
const path = require('path');

/**
 *
 * @param {Object} opts - options
 * @return {Object}
 */
const imgPlugin = (opts = {}) => {
  let images = [];
  let config = {};
  const options = opts;
  let command = {};
  let total = 0;

  const observer = new PerformanceObserver(items => {
    const entries = items.getEntries();
    const total = entries.find(i => i.name.startsWith('vite-plugin-img-duration'));
    if (total?.duration > 250) {
      const items = total.name.split(':')[1];
      config.logger.info(chalk.green(`Wrote ${items} images in ${(total.duration * 0.001).toFixed(2)}s (${Math.round(total.duration / items)}ms each)`));
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
      const neededImages = [];
      const { html } = await posthtml([postHTMLImg(neededImages, command, options)]).process(input, {
        sync: false,
      });

      if (neededImages.length && command.build) {
        const unique = neededImages.flat().filter(img => {
          const f = img.format !== 'svg';
          const compiled = images.findIndex(i => i?.src === img.src) >= 0;
          return !compiled && f;
        });

        images.push(unique);

        images = images.flat();

        total += await output(unique, config, command);
      }

      return html;
    },

    async writeBundle() {
      performance.measure(`vite-plugin-img-duration:${total}`, 'vite-plugin-img-start');
    },
  };
};

module.exports = { imgPlugin };
