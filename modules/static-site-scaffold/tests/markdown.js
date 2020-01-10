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
import test from 'ava';
import md from '../lib/11ty/markdown.js';

test('compiles markdown', t => {
  const input = '# Hello world';
  const output = md.render(input);
  const expected = '<h1>Hello world</h1>\n';
  t.is(output, expected);
});

test('compiles code using Prism', t => {
  const input = `\`\`\`js
const do = input => {
  console.log(input)
}
\`\`\``;
  const output = md.render(input);
  const expected = '<pre class="language-js"><code class="language-js"><span class="token keyword">const</span> <span class="token function-variable function">do</span> <span class="token operator">=</span> <span class="token parameter">input</span> <span class="token operator">=></span> <span class="token punctuation">{</span>\n  console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>input<span class="token punctuation">)</span>\n<span class="token punctuation">}</span>\n</code></pre>\n';
  t.is(output, expected);
});

test('transforms definition lists', t => {
  const input = `Term 1

: Definition 1

Term 2 with *inline markup*

: Definition 2

  Second paragraph of definition 2.`;
  const output = md.render(input);
  const expected = '<dl>\n<dt>Term 1</dt>\n<dd>\n<p>Definition 1</p>\n</dd>\n<dt>Term 2 with <em>inline markup</em></dt>\n<dd>\n<p>Definition 2</p>\n<p>Second paragraph of definition 2.</p>\n</dd>\n</dl>\n';
  t.is(output, expected);
});

test('transforms footnotes', t => {
  const input = `Here is an inline note.^[Inlines notes are easier to write, since you don't have to pick an identifier and move down to type the note.]`;
  const output = md.render(input);
  const expected = '<p>Here is an inline note.<sup class="footnote-ref"><a href="#fn1" id="fnref1">[1]</a></sup></p>\n<hr class="footnotes-sep">\n<section class="footnotes">\n<ol class="footnotes-list">\n<li id="fn1" class="footnote-item"><p>Inlines notes are easier to write, since you don’t have to pick an identifier and move down to type the note. <a href="#fnref1" class="footnote-backref">↩︎</a></p>\n</li>\n</ol>\n</section>\n';
  t.is(output, expected);
});

test('transforms superscript', t => {
  const input = '29^th^';
  const output = md.render(input);
  const expected = '<p>29<sup>th</sup></p>\n';
  t.is(output, expected);
});

test('transforms emoji', t => {
  const input = ':tada:';
  const output = md.render(input);
  const expected = '<p>🎉</p>\n';
  t.is(output, expected);
});

test('transforms attributes', t => {
  const input = '# header {.style-me}\nparagraph {data-toggle=modal}';
  const output = md.render(input);
  const expected = '<h1 class="style-me">header</h1>\n<p data-toggle="modal">paragraph</p>\n';
  t.is(output, expected);
});

test('transforms emmet containers', t => {
  const input = `!!! aside.warning
*Here be dragons*
!!!`;
  const output = md.render(input);
  const expected = '<aside class="warning"><p><em>Here be dragons</em></p>\n</aside>';
  t.is(output, expected);
});
