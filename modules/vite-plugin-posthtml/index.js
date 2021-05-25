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
    const total = entries.find((i) => i.name === 'duration');
    if (total.duration > 250) {
      console.error(`PostHTML took ${Math.round(total.duration)}ms to run`);
    }

    performance.clearMarks();
  });
  observer.observe({ entryTypes: ['measure'], type: 'measure' });

  return {
    name: 'posthtml',
    enforece: 'post',

    async transformIndexHtml(input) {
      performance.mark('start');
      const { html } = await renderer(plugins || []).process(input, options || {});
      performance.measure('duration', 'start');
      return html;
    },
  };
};

module.exports = { posthtmlPlugin };
