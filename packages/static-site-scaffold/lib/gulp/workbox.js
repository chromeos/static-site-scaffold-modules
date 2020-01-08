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
const path = require('path');
const sync = require('browser-sync');
const cache = require('gulp-cached');
const { spawn } = require('npm-run');
const { folders, serviceWorker } = require('config');

const production = process.env.NODE_ENV === 'production';

const destServiceWorker = path.join(folders.output, serviceWorker.dest);
const srcExternal = [path.join(folders.output, '**/*.{js,html,txt}'), `!${destServiceWorker}`];

/**
 * Reusable function to generate a Workbox precache for determined files
 *
 * @return {object} injected resources
 */
async function updateWorkbox() {
  return new Promise((res, rej) => {
    if (production) return res('Skipping');

    const child = spawn('npm', ['run', 'js:sw'], { stdio: 'inherit' });

    child.on('close', code => {
      return res(code);
    });
  });
}

/**
 * Watches files compiled from 11ty and Rollup to reload the server and rebuild the Service Worker
 *
 * @param {object} gulp - User instance of Gulp
 *
 * @return {object} Gulp watch object
 */
function externalRebuildTask(gulp) {
  return function rebuildServiceWorker() {
    return gulp.watch(srcExternal, () =>
      gulp
        .src(srcExternal)
        .pipe(cache('server'))
        .pipe(sync.stream())
        .on('end', updateWorkbox),
    );
  };
}

module.exports = {
  workbox: updateWorkbox,
  externalRebuildTask,
};
