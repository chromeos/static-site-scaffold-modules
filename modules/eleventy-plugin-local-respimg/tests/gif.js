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
const FileType = require('file-type');
const imageSize = require('image-size');
const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));

const path = require('path');
const { readdirSync, readFileSync } = require('fs');

const respimgSetup = require('../lib/respimg');

const sourcePath = path.join(__dirname, 'fixtures');
const outputBase = path.join(__dirname, 'output', 'gif');

// Ensure no images exist in the output base before starting
test.before('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

// Clean up after yourself
test.after.always('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

test('Optimizes GIFs, puts them in <picture>, generates WebP', async t => {
  const input = '<img src="/images/fugu-edit.gif" alt="Fugu Edit">';
  const outputImages = path.join(outputBase, 'optimize');
  const outputPath = 'file.html';
  const output = '<picture><source srcset="/images/fugu-edit.250.webp 250w, /images/fugu-edit.400.webp 400w, /images/fugu-edit.480.webp 480w" sizes="100vw" type="image/webp"><source srcset="/images/fugu-edit.250.gif 250w, /images/fugu-edit.400.gif 400w, /images/fugu-edit.480.gif 480w" sizes="100vw" type="image/gif"><img src="/images/fugu-edit.gif" alt="Fugu Edit" height="270" width="480" loading="lazy"></picture>';
  const transformer = respimgSetup({
    folders: {
      source: sourcePath,
      output: outputImages,
    },
  });
  const expectedImages = ['fugu-edit.250.gif', 'fugu-edit.250.webp', 'fugu-edit.400.gif', 'fugu-edit.400.webp', 'fugu-edit.480.gif', 'fugu-edit.480.webp'];

  t.is(await transformer(input, outputPath), output);
  t.deepEqual(readdirSync(path.join(outputImages, 'images')), expectedImages);

  const source = {
    file: readFileSync(path.join(sourcePath, '/images/fugu-edit.gif')),
  };
  source.size = imageSize(source.file); // .height, .width, .type
  source.type = await FileType.fromBuffer(source.file); // ext, mine image/png image/webp
  source.ratio = source.size.height / source.size.width;

  for (const image of expectedImages) {
    const output = readFileSync(path.join(outputImages, 'images', image));
    const expected = {
      width: parseInt(image.split('.')[1]),
      height: Math.round(parseInt(image.split('.')[1]) * source.ratio),
      type: `image/${image.split('.')[2]}`,
    };
    const actual = {
      size: imageSize(output),
      type: await FileType.fromBuffer(output),
    };

    t.is(actual.size.width, expected.width);
    t.is(actual.size.height, expected.height);
    t.is(actual.type.mime, expected.type);
  }
});
