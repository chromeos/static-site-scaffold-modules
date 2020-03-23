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
import safeExternalLinksSetup from '../lib/links';

test('No config', t => {
  const input = '<a href="https://foo.com" rel="banana">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="https://foo.com" rel="banana noopener">Hello World</a>';
  const transformer = safeExternalLinksSetup();

  t.is(transformer(input, outputPath), output);
});

test('No config, no existing rel', t => {
  const input = '<a href="https://foo.com">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="https://foo.com" rel="noopener">Hello World</a>';
  const transformer = safeExternalLinksSetup();

  t.is(transformer(input, outputPath), output);
});

test('No nothing', t => {
  const input = '<a href="https://foo.com">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="https://foo.com">Hello World</a>';
  const transformer = safeExternalLinksSetup({ noopener: false });

  t.is(transformer(input, outputPath), output);
});

test('Add noreferrer', t => {
  const input = '<a href="https://foo.com" rel="banana">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="https://foo.com" rel="banana noopener noreferrer">Hello World</a>';
  const transformer = safeExternalLinksSetup({ noreferrer: true });

  t.is(transformer(input, outputPath), output);
});

test('Remove noopener', t => {
  const input = '<a href="https://foo.com" rel="banana">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="https://foo.com" rel="banana">Hello World</a>';
  const transformer = safeExternalLinksSetup({ noopener: false });

  t.is(transformer(input, outputPath), output);
});

test('Change Pattern', t => {
  const input = '<a href="foo.com" rel="banana">Hello World</a>';
  const outputPath = 'file.html';
  const output = '<a href="foo.com" rel="banana noopener">Hello World</a>';
  const transformer = safeExternalLinksSetup({ pattern: 'foo.com' });

  t.is(transformer(input, outputPath), output);
});

test('Ignore file extension', t => {
  const input = '<a href="foo.com" rel="banana">Hello World</a>';
  const outputPath = 'file.md';
  const output = '<a href="foo.com" rel="banana">Hello World</a>';
  const transformer = safeExternalLinksSetup();

  t.is(transformer(input, outputPath), output);
});

test('Has body', t => {
  const input = '<body><a href="foo.com" rel="banana">Hello World</a></body>';
  const outputPath = 'file.html';
  const output = '<html><head></head><body><a href="foo.com" rel="banana">Hello World</a></body></html>';
  const transformer = safeExternalLinksSetup();

  t.is(transformer(input, outputPath), output);
});

test('No links', t => {
  const input = '<h1>Hello World</h1>';
  const outputPath = 'file.html';
  const output = '<h1>Hello World</h1>';
  const transformer = safeExternalLinksSetup();

  t.is(transformer(input, outputPath), output);
});
