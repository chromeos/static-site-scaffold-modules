const posthtml = require('posthtml');
const { PerformanceObserver, performance } = require('perf_hooks');

/**
 *
 * @param {Object} opts Options for the plugin
 * @param {Function[]} [opts.plugins] PostHTML plugins to use
 * @param {Function} [opts.posthtml] PostHTML instance to use
 * @param {Object} [opts.options] PostHTML options. Will always run in asynchronous mode
 * @return {Object} Vite plugin
 */
const posthtmlPlugin = (opts = {}) => {
  const { options, plugins, renderer } = Object.assign(
    {
      renderer: posthtml,
      options: {},
      plugins: [],
    },
    opts,
  );
  options.sync = false;

  const observer = new PerformanceObserver((items) => {
    const entries = items.getEntries();
    const total = entries.find((i) => i.name.startsWith('vite-plugin-posthtml-duration'));
    if (total?.duration > 250) {
      console.error(
        `PostHTML took ${Math.round(total.duration)}ms to run for path ${total.name.split(':')[1]}`,
      );
    }

    performance.clearMarks();
  });
  observer.observe({ entryTypes: ['measure'], type: 'measure' });

  return {
    name: 'posthtml',
    enforece: 'post',

    async transformIndexHtml(input, { path: pth }) {
      performance.mark(`vite-plugin-posthtml-start:${pth}`);
      const { html } = await renderer(plugins || []).process(input, options || {});
      performance.measure(
        `vite-plugin-posthtml-duration:${pth}`,
        `vite-plugin-posthtml-start:${pth}`,
      );
      return html;
    },
  };
};

module.exports = { posthtmlPlugin };
