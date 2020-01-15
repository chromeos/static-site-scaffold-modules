const { cosmiconfigSync } = require('cosmiconfig');
const isPromise = require('is-promise');
const emoji = require('./emoji');

const path = require('path');
const { existsSync } = require('fs');

const explorerSync = cosmiconfigSync('commit');
const foundConfig = explorerSync.search();
const userConfig = foundConfig ? foundConfig.config : {};
let scopes = [];

if (existsSync(path.join(process.cwd(), 'lerna.json'))) {
  scopes = require('./scopes');
}

const config = {
  emoji,
  scopes: userConfig.scopes || scopes,
};

if (typeof config.scopes === 'function' && config.scopes.constructor.name !== 'AsyncFunction') {
  config.scopes = Promise.resolve(config.scopes());
} else if (typeof config.scopes !== 'function' && !isPromise(config.scopes)) {
  if (config.scopes.length === 0) {
    throw new Error("Scopes can't be empty!");
  }
  config.scopes = Promise.resolve(config.scopes);
}

if (userConfig.emoji) {
  config.emoji = config.emoji.filter(emoji => userConfig.emoji.includes(emoji.name));
}

module.exports = config;
