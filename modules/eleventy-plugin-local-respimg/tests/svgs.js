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
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const path = require('path');
const { readdirSync } = require('fs');

const respimgSetup = require('../lib/respimg');

const sourcePath = path.join(__dirname, 'fixtures');
const outputBase = path.join(__dirname, 'output', 'svg');

// Ensure no images exist in the output base before starting
test.before('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

// Clean up after yourself
test.after.always('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

test('Optimizes SVGs', async t => {
  const input = '<img src="/images/fish.svg" alt="Fish">';
  const outputImages = path.join(outputBase, 'optimize');
  const outputPath = 'file.html';
  const output = '<img src="/images/fish.svg" alt="Fish" height="192" width="192" loading="lazy">';
  const transformer = respimgSetup({
    folders: {
      source: sourcePath,
      output: outputImages,
    },
  });
  const expectedImages = ['fish.svg'];

  t.is(await transformer(input, outputPath), output);
  t.deepEqual(readdirSync(path.join(outputImages, 'images')), expectedImages);
});
