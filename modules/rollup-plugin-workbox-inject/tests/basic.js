import test from 'ava';
import workboxInject from '../index.js';

test('Is a thing', t => {
  const plugin = workboxInject();

  t.is(plugin.name, 'workbox-inject');
  t.is(typeof plugin.generateBundle, 'function');
  t.is(plugin.generateBundle.constructor.name, 'AsyncFunction');
});
