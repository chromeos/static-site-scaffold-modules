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
const respimgSetup = require('../lib/respimg');

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
