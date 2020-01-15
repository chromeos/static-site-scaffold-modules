const { cosmiconfigSync } = require('cosmiconfig');
const emoji = require('./emoji');

const path = require('path');
const { existsSync } = require('fs');

const explorerSync = cosmiconfigSync('commit');
const foundConfig = explorerSync.search();
const userConfig = foundConfig ? foundConfig.config : {};
let scopes = [];

if (existsSync(path.join(process.cwd(), 'lerna.json'))) {
  scopes = require('./scopes');
} else {
  scopes = userConfig.scopes;
}

const config = {
  emoji,
};

if (typeof scopes === 'function') {
  if (scopes.constructor.name !== 'AsyncFunction') {
    config.scopes = async function getScopes() {
      return scopes();
    };
  } else {
    config.scopes = scopes;
  }
} else {
  if (scopes.length === 0) {
    throw new Error("Scopes can't be empty!");
  }
  config.scopes = async function getScopes() {
    return scopes;
  };
}

if (userConfig.emoji) {
  config.emoji = config.emoji.filter(emoji => userConfig.emoji.includes(emoji.name));
}

module.exports = config;
