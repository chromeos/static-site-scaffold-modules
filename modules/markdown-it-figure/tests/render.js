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

const test = require('ava');
const markdown = require('markdown-it');
const figurePlugin = require('../index.js');

const md = markdown({ html: true, linkify: true }).use(figurePlugin);

test('All the bells and whistles', t => {
  const input = '#1234[Look At This Caption](/images/foo.png [Foo Bar])';
  const output = '<p><figure id="figure-1234"><img src="/images/foo.png" alt="Foo Bar"/><figcaption><p><span class="figure-id">1234: </span>Look At This Caption</p></figcaption></figure></p>\n';

  t.is(md.render(input), output);
});

test('Weird Input', t => {
  const input = '#asdf[Look At This Caption](/images/foo.png)';
  const output = '<p>#asdf<a href="/images/foo.png">Look At This Caption</a></p>\n';

  t.is(md.render(input), output);
});

test('No figure', t => {
  const input = 'Look At This Caption';
  const output = '<p>Look At This Caption</p>\n';

  t.is(md.render(input), output);
});
