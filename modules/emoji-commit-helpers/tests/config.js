const test = require('ava');
const scopes = require('../lib/scopes');
const emoji = require('../lib/emoji');
const config = require('../lib/config');

test('Grabs all Lerna modules, plus root', async t => {
  const expected = [
    { name: 'root', description: 'Root project' },
    {
      name: 'eleventy-plugin-local-respimg',
      description: 'Eleventy plugin for optimizing and making responsive local images',
    },
    {
      name: 'eleventy-plugin-safe-external-links',
      description: 'Eleventy plugin for ensuring safe external links',
    },
    {
      name: 'emoji-commit-helpers',
      description: 'Commitlint and Commitizen helpers for working with Gitmoji',
    },
    {
      name: 'markdown-it-figure',
      description: 'Markdown It plugin to add Figure elements',
    },
    {
      name: 'rollup-plugin-workbox-inject',
      description: 'Inject workbox precaching into a Rollup compiled service worker',
    },
    {
      name: 'service-worker-i18n-redirect',
      description: 'i18n redirection using Workbox',
    },
    {
      name: 'service-worker-includes',
      description: 'Service Worker Includes using Workbox',
    },
    {
      name: 'static-site-scaffold',
      description: 'Eleventy based static site scaffolding',
    },
  ];
  t.deepEqual(await scopes(), expected);
});

test('Generates config from .commitrc.yml', async t => {
  const expectedScopes = [
    { name: 'First', description: 'First Scope' },
    { name: 'Second', description: 'Second Scope' },
  ];
  t.deepEqual(config.emoji, emoji);
  t.deepEqual(await config.scopes(), expectedScopes);
});
