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
import rollup from '../lib/rollup.config.js';
import config from 'config';
import path from 'path';
import clone from 'lodash.clonedeep';

test('ESM exported correctly', t => {
  // ESMs
  t.deepEqual(Object.keys(rollup.esm.input), Object.keys(config.javascript.esm), 'Exported ESM inputs are the same as config');
  t.deepEqual(Object.values(rollup.esm.input), Object.values(config.javascript.esm).map(i => path.join(config.folders.source, i)), 'Exported ESM outputs are the same as config, plus input directory');
  t.is(rollup.esm.output.format, 'esm');
});

test('IIFE exported correctly', t => {
  // IIFEs
  rollup.iifes.forEach((iife, i) => {
    const input = path.join(config.folders.source, Object.values(config.javascript.iife)[i]);
    const output = Object.keys(config.javascript.iife)[i];
    t.is(iife.output.name, output);
    t.is(iife.input, input);
    t.is(iife.output.format, 'iife');
  });
});

test('Plugins exported correctly', t => {
  // Plugins are included
  const plugins = ['replace', 'node-resolve', 'eslint', 'babel'];
  rollup.plugins.forEach(p => {
    t.true(plugins.includes(p.name));
  });
});

test('Default exported correctly', t => {
  // Files
  const files = clone(rollup.iifes);
  files.unshift(rollup.esm);
  t.deepEqual(rollup.files, files);

  t.true(Array.isArray(rollup.default));

  rollup.default.forEach((item, i) => {
    if (i === 0) {
      t.deepEqual(item.input, rollup.esm.input);
      t.deepEqual(item.output, rollup.esm.output);
    } else {
      t.deepEqual(item.input, rollup.iifes[i - 1].input);
      t.deepEqual(item.output, rollup.iifes[i - 1].output);
    }

    t.deepEqual(item.plugins, rollup.plugins);
  });
});
