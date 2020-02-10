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
const cheerio = require('cheerio');
const path = require('path');

/**
 *
 * @param {object} config
 * @return {function}
 */
function safeExternalLinksSetup(config = {}) {
  const pattern = new RegExp(config.pattern || 'https{0,1}://');
  const noopener = config.hasOwnProperty('noopener') ? config.noopener : true;
  const noreferrer = config.hasOwnProperty('noreferrer') ? config.noreferrer : false;
  const files = config.files || ['.html'];

  /**
   * @param {string} content
   * @param {string} outputPath
   * @return {string}
   */
  return function safeExternalLinks(content, outputPath) {
    const ext = path.extname(outputPath);

    console.log(ext);
    console.log(!files.includes(ext));

    if (!files.includes(ext)) return content;

    try {
      const $ = cheerio.load(content);
      const links = $('a').get();

      if (links.length) {
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const href = $(link).attr('href');

          if (pattern.test(href)) {
            const rel = [];
            if (noopener) {
              rel.push('noopener');
            }

            if (noreferrer) {
              rel.push('noreferrer');
            }

            if (rel.length) {
              $(link).attr('rel', rel.join(' '));
            }

            $(link).replaceWith($.html(link));
          }
        }

        return $.html();
      }
    } catch (e) {
      // console.error(e);
    }

    return content;
  };
}

module.exports = safeExternalLinksSetup;
