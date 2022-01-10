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
const slugify = require('uslug');

const Prism = require('prismjs/components/prism-core');
const components = require('prismjs/components/index');

// Load all components
components();

const md = markdown({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-attrs'))
  .use(require('markdown-it-figure'))
  .use(require('markdown-it-video'))
  .use(require('markdown-it-header-sections'))
  .use(require('markdown-it-kbd'))
  .use(require('markdown-it-anchor'), {
    slugify,
    permalink: true,
    renderPermalink(slug, opts, state, idx) {
      const linkTokens = [
        Object.assign(new state.Token('link_open', 'a', 1), {
          attrs: [
            ['class', 'header-anchor'],
            ['href', `#${slug}`],
          ],
        }),
        ...state.tokens[idx + 1].children,
      ];

      linkTokens.push(new state.Token('link_close', 'a', -1));

      state.tokens[idx + 1].children = linkTokens;
    },
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
  })
  .disable('code');

// Blockquote rules
// Optional cite moves to blockquote footer
md.renderer.rules.blockquote_open = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const citeIndex = Array.isArray(token.attrs) ? token.attrs.findIndex(attr => attr[0] === 'cite') : null;

  if (citeIndex !== null) {
    let nextClose = null;
    for (let i = idx + 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type === 'blockquote_close') {
        nextClose = t;
        break;
      }
    }
    if (nextClose) {
      nextClose.cite = token.attrs[citeIndex][1];
      token.attrs.splice(citeIndex, 1);
    }
  }

  const blockquoteTokenHTML = `<blockquote${slf.renderAttrs(token)}>`;

  return blockquoteTokenHTML;
};

md.renderer.rules.blockquote_close = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const { cite } = token;

  if (cite) {
    return `<footer>${cite}</footer></blockquote>`;
  }

  return '</blockquote>';
};

// Code Fence rules
// Wraps code fences in figures, optional titles become figcaptions
md.renderer.rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const titleIndex = Array.isArray(token.attrs) ? token.attrs.findIndex(attr => attr[0] === 'title') : null;
  let title = null;

  if (titleIndex !== null) {
    title = token.attrs[titleIndex][1];
    token.attrs.splice(titleIndex, 1);
  }

  let languageTokenHTML = `<figure${slf.renderAttrs(token)}>`;
  if (title) {
    languageTokenHTML += `<figcaption>${title}</figcaption>`;
  }

  if (token.info) {
    languageTokenHTML += `<pre class="language-${token.info}"><code class="language-${token.info}">${Prism.highlight(token.content, Prism.languages[token.info], token.info)}</code></pre>`;
  } else {
    languageTokenHTML += `<pre class="language-unknown"><code class="language-unknown">${token.content}</code></pre>`;
  }

  languageTokenHTML += `</figure>`;

  return languageTokenHTML;
};

module.exports = md;
