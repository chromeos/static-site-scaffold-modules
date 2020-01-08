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
const sync = require('browser-sync');
const { folders } = require('config');

/**
 * Runs a BrowserSync server
 *
 * @param {string} dir - The directory that BrowserSync should run against
 *
 * @return {function} Function to start a BrowserSync instance
 */
function server() {
  return function() {
    return sync.init({
      server: folders.output,
    });
  };
}

module.exports = {
  server,
};
