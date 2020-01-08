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
const { folders, serviceWorker } = require('config');
const path = require('path');
const config = require('./rollup.config');
const workboxInject = require('./rollup/workbox-inject.js');

const output = {
  name: serviceWorker.dest,
  format: 'iife',
  sourcemap: true,
  dir: folders.output,
};

const workboxConfig = {
  swSrc: path.join(folders.input, serviceWorker.src),
  swDest: path.join(folders.output, serviceWorker.dest),
  globDirectory: folders.output,
  globPatterns: serviceWorker.precache,
};

const plugins = config.plugins;
plugins.push(workboxInject(workboxConfig));

module.exports = {
  input: path.join(folders.input, serviceWorker.src),
  output,
  plugins,
};
