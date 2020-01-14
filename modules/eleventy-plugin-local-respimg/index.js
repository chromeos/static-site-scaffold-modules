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

const respimg = require('./lib/respimg');
const path = require('path');

module.exports = {
  configFunction(eleventy, config = {}) {
    eleventy.addTransform('respimg', respimg(config));
    if (eleventy.addWatchTarget && config.images.watch) {
      if (Array.isArray(config.images.watch.src)) {
        config.images.watch.src.map(p => eleventy.addWatchTarget(path.join(config.folders.source, p)));
      } else {
        eleventy.addWatchTarget(path.join(config.folders.source, config.images.watch.src));
      }
    }
  },
};
