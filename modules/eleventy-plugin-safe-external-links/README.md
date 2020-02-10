# Eleventy Plugin Safe External Links

[Eleventy plugin](https://www.11ty.dev/docs/plugins/) ensuring that external links always contain `rel="noopener"`, `rel="noreferrer"`, which are [potentially unsafe otherwise](https://web.dev/external-anchors-use-rel-noopener/).

## Usage

```js
const pluginLocalRespimg = require('eleventy-plugin-safe-external-links');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin('safe-external-links', {
      pattern: 'https{0,1}://', // RegExp pattern for external links
      noopener: true, // Whether to include noopener
      noreferrer: false, // Whether to include noreferrer
      files: [ // What output file extensions to work on
        '.html'
      ],
    },
  });
};
```
