const { cosmiconfigSync } = require('cosmiconfig');
const emoji = require('./emoji');

const path = require('path');
const fs = require('fs');

/**
 * Generates shared config
 *
 * @return {object} config object
 */
function generateConfig() {
  const config = {
    emoji,
  };

  const explorerSync = cosmiconfigSync('commit');
  const foundConfig = explorerSync.search();
  const userConfig = foundConfig ? foundConfig.config : {};
  let scopes = [];

  if (exists(path.join(process.cwd(), 'lerna.json'))) {
    scopes = require('./scopes');
  } else {
    scopes = userConfig.scopes || [];
  }

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

  return config;
}

/**
 * @param {string} filepath - Filepath to test
 * @return {boolean}
 */
function exists(filepath) {
  try {
    (fs.accessSync || fs.statSync)(filepath);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = generateConfig();
