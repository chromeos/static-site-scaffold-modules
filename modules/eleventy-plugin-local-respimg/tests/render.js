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
const path = require('path');

const respimgSetup = require('../lib/respimg');

const sourcePath = path.join(__dirname, 'fixtures');
const outputBase = path.join(__dirname, 'output', 'jpg');

test('Non-HTML Output Path', async t => {
  const input = '<h1>Hello World</h1>';
  const outputPath = 'file.txt';
  const output = '<h1>Hello World</h1>';
  const transformer = respimgSetup();

  t.is(await transformer(input, outputPath), output);
});

test('HTML Output Path', async t => {
  const input = '<h1>Hello World</h1>';
  const outputPath = 'file.html';
  const output = '<h1>Hello World</h1>';
  const transformer = respimgSetup();

  t.is(await transformer(input, outputPath), output);
});

test('HTML Output Path, wrapped', async t => {
  const input = '<body><h1>Hello World</h1></body>';
  const outputPath = 'file.html';
  const output = '<body><h1>Hello World</h1></body>';
  const transformer = respimgSetup();

  t.is(await transformer(input, outputPath), output);
});

test('Ignore <picture> wrapped <img>', async t => {
  const outputImages = path.join(outputBase, 'optimize');
  const input = '<picture><img src="/images/crowne-plaza-hefei.jpg" alt="Crowne Plaza Hefei"></picture>';
  const outputPath = 'file.html';
  const output = '<picture><img src="/images/crowne-plaza-hefei.jpg" alt="Crowne Plaza Hefei"></picture>';
  const transformer = respimgSetup({
    folders: {
      source: sourcePath,
      output: outputImages,
    },
  });

  t.is(await transformer(input, outputPath), output);
});

test('Adds classes to picture element', async t => {
  const outputImages = path.join(outputBase, 'optimize');
  const input = '<img class="test one two" src="/images/crowne-plaza-hefei.jpg" alt="Crowne Plaza Hefei">';
  const outputPath = 'file2.html';
  const output = '<picture class="test one two"><source srcset="/images/crowne-plaza-hefei.250.webp 250w, /images/crowne-plaza-hefei.400.webp 400w, /images/crowne-plaza-hefei.550.webp 550w, /images/crowne-plaza-hefei.700.webp 700w, /images/crowne-plaza-hefei.850.webp 850w, /images/crowne-plaza-hefei.1000.webp 1000w, /images/crowne-plaza-hefei.1150.webp 1150w, /images/crowne-plaza-hefei.1300.webp 1300w, /images/crowne-plaza-hefei.1450.webp 1450w, /images/crowne-plaza-hefei.1500.webp 1500w" sizes="100vw" type="image/webp"><source srcset="/images/crowne-plaza-hefei.250.jpg 250w, /images/crowne-plaza-hefei.400.jpg 400w, /images/crowne-plaza-hefei.550.jpg 550w, /images/crowne-plaza-hefei.700.jpg 700w, /images/crowne-plaza-hefei.850.jpg 850w, /images/crowne-plaza-hefei.1000.jpg 1000w, /images/crowne-plaza-hefei.1150.jpg 1150w, /images/crowne-plaza-hefei.1300.jpg 1300w, /images/crowne-plaza-hefei.1450.jpg 1450w, /images/crowne-plaza-hefei.1500.jpg 1500w" sizes="100vw" type="image/jpeg"><img class="test one two" src="/images/crowne-plaza-hefei.jpg" alt="Crowne Plaza Hefei" height="2000" width="1500" loading="lazy"></picture>';
  const transformer = respimgSetup({
    folders: {
      source: sourcePath,
      output: outputImages,
    },
    images: {
      hoistClasses: true,
    },
  });

  t.is(await transformer(input, outputPath), output);
});
