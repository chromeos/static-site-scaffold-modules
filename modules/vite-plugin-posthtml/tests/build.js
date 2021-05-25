const test = require('ava');
const { build } = require('vite');
const del = require('del');
const config = require('./fixtures/vite.config');
const { readFile } = require('fs/promises');
const path = require('path');

test('PostHTML is run on build', async (t) => {
  const folder = `${new Date().getTime()}`;
  await build(config(folder));
  const output = await readFile(path.join(__dirname, `fixtures/${folder}/index.html`), 'utf-8');

  t.true(output.startsWith('<!DOCTYPE html>'));
  await del([path.join(__dirname, `fixtures/${folder}`)]);
});
