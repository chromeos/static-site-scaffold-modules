import test from 'ava';
import { build } from 'vite';
import del from 'del';
import config from './fixtures/vite.config.mjs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import desm from 'desm';

const __dirname = desm(import.meta.url);

test('PostHTML is run on build', async (t) => {
  const folder = `${new Date().getTime()}`;
  await build(config(folder));
  const output = await readFile(join(__dirname, `fixtures/${folder}/index.html`), 'utf-8');

  t.true(output.startsWith('<!DOCTYPE html>'));
  await del([join(__dirname, `fixtures/${folder}`)]);
});
