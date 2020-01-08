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
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const { eslint } = require('rollup-plugin-eslint');
const clone = require('lodash.clonedeep');
const { folders, javascript } = require('config');
const path = require('path');

const production = process.env.NODE_ENV === 'production';

const input = {};
const output = {
  format: 'esm',
  sourcemap: true,
  dir: folders.output,
};

// ESMs
const esm = { input, output };
if (javascript.esm) {
  for (const [key, value] of Object.entries(javascript.esm)) {
    input[key] = path.join(folders.input, value);
  }
}

// IIFEs
const iifes = [];
if (javascript.iife) {
  for (const [key, value] of Object.entries(javascript.iife)) {
    const iifeOutput = clone(output);
    iifeOutput.name = key;
    iifeOutput.format = 'iife';

    iifes.push({
      input: path.join(folders.input, value),
      output: iifeOutput,
    });
  }
}

// Plugins
const plugins = [];

plugins.push(
  replace({
    PRODUCTION: production,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }),
);

plugins.push(nodeResolve());

plugins.push(
  eslint({
    throwOnError: production,
  }),
);

plugins.push(babel());

if (production) {
  plugins.push(
    terser({
      module: true,
    }),
  );
}

// Files
const files = clone(iifes);
files.unshift(esm);

// All
const all = clone(iifes).map(i => {
  i.plugins = plugins;
  return i;
});
all.unshift({ input, plugins, output });

module.exports = {
  plugins,
  esm,
  iifes,
  files,
  default: all,
};
