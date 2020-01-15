const { cosmiconfigSync } = require('cosmiconfig');
const isPromise = require('is-promise');
const scopes = require('./scopes');
const emoji = require('./emoji');

const explorerSync = cosmiconfigSync('commit');
const foundConfig = explorerSync.search();
const userConfig = foundConfig ? foundConfig.config : {};

const config = {
  emoji,
  scopes: userConfig.scopes || scopes,
};

if (typeof config.scopes === 'function' && config.scopes.constructor.name !== 'AsyncFunction') {
  config.scopes = Promise.resolve(config.scopes());
} else if (typeof config.scopes !== 'function' && !isPromise(config.scopes)) {
  config.scopes = Promise.resolve(config.scopes);
}

if (userConfig.emoji) {
  config.emoji = config.emoji.filter(emoji => userConfig.emoji.includes(emoji.name));
}

module.exports = config;
