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
const outputBase = path.join(__dirname, 'output', 'png');

// Ensure no images exist in the output base before starting
test.before('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

// Clean up after yourself
test.after.always('Cleanup Output Images', async t => {
  await rimraf(outputBase);
});

test('Optimizes PNGs, puts them in <picture>, generates WebP', async t => {
  const input = '<img src="/images/crowne-plaza-hefei.png" alt="Crowne Plaza Hefei">';
  const outputImages = path.join(outputBase, 'optimize');
  const outputPath = 'file.html';
  const output = '<picture><source srcset="/images/crowne-plaza-hefei.250.webp 250w, /images/crowne-plaza-hefei.400.webp 400w, /images/crowne-plaza-hefei.550.webp 550w, /images/crowne-plaza-hefei.700.webp 700w, /images/crowne-plaza-hefei.850.webp 850w, /images/crowne-plaza-hefei.1000.webp 1000w, /images/crowne-plaza-hefei.1150.webp 1150w, /images/crowne-plaza-hefei.1300.webp 1300w, /images/crowne-plaza-hefei.1450.webp 1450w, /images/crowne-plaza-hefei.1500.webp 1500w" sizes="100vw" type="image/webp"><source srcset="/images/crowne-plaza-hefei.250.png 250w, /images/crowne-plaza-hefei.400.png 400w, /images/crowne-plaza-hefei.550.png 550w, /images/crowne-plaza-hefei.700.png 700w, /images/crowne-plaza-hefei.850.png 850w, /images/crowne-plaza-hefei.1000.png 1000w, /images/crowne-plaza-hefei.1150.png 1150w, /images/crowne-plaza-hefei.1300.png 1300w, /images/crowne-plaza-hefei.1450.png 1450w, /images/crowne-plaza-hefei.1500.png 1500w" sizes="100vw" type="image/png"><img src="/images/crowne-plaza-hefei.png" alt="Crowne Plaza Hefei" height="2000" width="1500" loading="lazy"></picture>';
  const transformer = respimgSetup({
    folders: {
      source: sourcePath,
      output: outputImages,
    },
  });
  const expectedImages = ['crowne-plaza-hefei.1000.png', 'crowne-plaza-hefei.1000.webp', 'crowne-plaza-hefei.1150.png', 'crowne-plaza-hefei.1150.webp', 'crowne-plaza-hefei.1300.png', 'crowne-plaza-hefei.1300.webp', 'crowne-plaza-hefei.1450.png', 'crowne-plaza-hefei.1450.webp', 'crowne-plaza-hefei.1500.png', 'crowne-plaza-hefei.1500.webp', 'crowne-plaza-hefei.250.png', 'crowne-plaza-hefei.250.webp', 'crowne-plaza-hefei.400.png', 'crowne-plaza-hefei.400.webp', 'crowne-plaza-hefei.550.png', 'crowne-plaza-hefei.550.webp', 'crowne-plaza-hefei.700.png', 'crowne-plaza-hefei.700.webp', 'crowne-plaza-hefei.850.png', 'crowne-plaza-hefei.850.webp'];

  t.is(await transformer(input, outputPath), output);
  t.deepEqual(readdirSync(path.join(outputImages, 'images')), expectedImages);

  const source = {
    file: readFileSync(path.join(sourcePath, '/images/crowne-plaza-hefei.png')),
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
