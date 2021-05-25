const { build } = require('vite');
const posthtml = require('../index');
const doctype = require('posthtml-doctype');

(async () => {
  await build({
    root: __dirname,
    plugins: [
      posthtml({
        plugins: [doctype({ doctype: 'HTML 5' })],
      }),
    ],
  });
})();
