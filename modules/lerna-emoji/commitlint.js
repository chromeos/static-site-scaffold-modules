const emojiRegexp = require('emoji-regex');
const getScopes = require('./lib/scopes');
const emoji = require('./lib/emoji');

const types = emoji.map(e => e.code).concat(emoji.map(e => e.emoji));

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
  utils: { getScopes },
  rules: {
    'scope-enum': ctx => getScopes(ctx).then(scopes => [2, 'always', scopes]),
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
