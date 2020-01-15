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
const emojiRegexp = require('emoji-regex');
const config = require('./lib/config');

const types = config.emoji.map(e => e.code).concat(config.emoji.map(e => e.emoji));

const regex = `${emojiRegexp()}`
  .substr(1)
  .slice(0, -2)
  .replace('\\u', '\\\\u');

const headerPattern = `^((:\\w*:)|(${regex}))(?:\\s)(?:\\((.*?)\\))?\\s((?:.*(?=\\())|.*)(?:\\(#(\\d*)\\))?`;

module.exports = {
  parserPreset: {
    parserOpts: {
      headerPattern,
      headerCorrespondence: ['type', '', '', 'scope', 'subject', 'ticket'],
    },
  },
  rules: {
    'scope-enum': ctx => config.scopes(ctx).then(scopes => [2, 'always', scopes.map(scope => scope.name)]),
    'type-enum': [2, 'always', types],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', ['sentence-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', ['.']],
    'subject-max-length': [2, 'always', 50],
    'subject-min-length': [2, 'always', 3],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
  },
};
