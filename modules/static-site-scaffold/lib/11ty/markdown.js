/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const markdown = require('markdown-it');
const { expand } = require('@emmetio/expand-abbreviation');
const uslug = require('uslug');

const Prism = require('prismjs/components/prism-core');
const components = require('prismjs/components/index');

// Load all components
components();

const md = markdown({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
  },
})
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-figure'))
  .use(require('markdown-it-video'))
  .use(require('markdown-it-anchor'), {
    slugify: s => uslug(s),
    permalink: true,
    permalinkBefore: true,
  })
  .use(require('markdown-it-container'), 'emmet', {
    marker: '!',
    validate(params) {
      return expand(params).split('</').length === 2;
    },
    render(tokens, idx) {
      let token = tokens[idx];

      if (token.nesting === 1) {
        const expanded = expand(token.info);
        const closing = expanded.lastIndexOf('</');
        return expanded.substring(0, closing);
      }
      while (token.info === '') {
        idx--;
        token = tokens[idx];
      }
      const expanded = expand(token.info);
      const closing = expanded.lastIndexOf('</');
      return expanded.substring(closing, expanded.length);
    },
  });

module.exports = md;
