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
  const options = Object.assign(
    {
      formats: {
        avif: true,
        webp: true,
      },
      resize: {
        min: 250,
        max: 1500,
        step: 150,
      },
      wrapSVG: false, // Whether to wrap SVG in Picture element
      attrs: ['class'], // Attributes to include on picture element from img
      gifToVideo: true, // Still need to build this out
      sizes: '100vw',
      lazy: true,
      optimizer: 'squoosh', // squoosh or sharp
    },
    opts,
  );

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
      options.build = resolvedConfig.command === 'build';
      options.dirs = {
        root: resolvedConfig.publicDir,
        out: path.join(resolvedConfig.root, resolvedConfig.build.outDir),
        cache: path.join(resolvedConfig.cacheDir, 'images'),
        external: '@fs',
      };
      options.logger = resolvedConfig.logger;
    },

    async transformIndexHtml(input) {
      performance.mark('vite-plugin-img-start');
      const { html } = await posthtml([postHTMLImg(images, options)]).process(input, {
        sync: false,
      });

      // Need to flatten the array after ach run so the memoization works in the plugin
      images = images.flat();

      return html;
    },

    async writeBundle() {
      performance.measure(`vite-plugin-img-duration:${total}`, 'vite-plugin-img-start');
    },
  };
};

module.exports = { imgPlugin };
