const test = require('ava');
const { imgPlugin } = require('../index');
const FileType = require('file-type');
const clone = require('lodash.clonedeep');
const fs = require('fs-extra');
const path = require('path');

const resolvedConfig = {
  publicDir: path.join(__dirname, 'fixtures'),
  root: path.join(__dirname, 'fixtures'),
  build: {
    outDir: 'out',
  },
  cacheDir: path.join(__dirname, '../.cache'),
  logger: {
    info: console.log,
    error: console.error,
  },
};

/**
 * Creates config with a generated random path
 * @param {string} command serve or build, the command to use when generating a random path
 * @return {object}
 */
function generateRandomPath(command = 'build') {
  const pth = `out--${Math.round(Math.random() * Date.now())}`;
  const config = clone(resolvedConfig);
  config.command = command;
  config.build = {
    outDir: pth,
  };
  return {
    config,
    pth,
  };
}

test('Returns a Vite plugin', t => {
  const plugin = imgPlugin();

  t.is(plugin.name, 'image');
  t.is(plugin.enforce, 'post');
});

test('Transforms image HTML on build', async t => {
  const plugin = imgPlugin();
  const input = '<img src="/lobster-mac-n-cheese.jpg" />';
  const expected = '<picture>\n<source srcset="/lobster-mac-n-cheese.250.avif 250w, /lobster-mac-n-cheese.400.avif 400w, /lobster-mac-n-cheese.550.avif 550w, /lobster-mac-n-cheese.700.avif 700w, /lobster-mac-n-cheese.850.avif 850w, /lobster-mac-n-cheese.1000.avif 1000w, /lobster-mac-n-cheese.1150.avif 1150w, /lobster-mac-n-cheese.1300.avif 1300w, /lobster-mac-n-cheese.1450.avif 1450w, /lobster-mac-n-cheese.1500.avif 1500w" sizes="100vw" type="image/avif">\n\n<source srcset="/lobster-mac-n-cheese.250.webp 250w, /lobster-mac-n-cheese.400.webp 400w, /lobster-mac-n-cheese.550.webp 550w, /lobster-mac-n-cheese.700.webp 700w, /lobster-mac-n-cheese.850.webp 850w, /lobster-mac-n-cheese.1000.webp 1000w, /lobster-mac-n-cheese.1150.webp 1150w, /lobster-mac-n-cheese.1300.webp 1300w, /lobster-mac-n-cheese.1450.webp 1450w, /lobster-mac-n-cheese.1500.webp 1500w" sizes="100vw" type="image/webp">\n\n<source srcset="/lobster-mac-n-cheese.250.jpeg 250w, /lobster-mac-n-cheese.400.jpeg 400w, /lobster-mac-n-cheese.550.jpeg 550w, /lobster-mac-n-cheese.700.jpeg 700w, /lobster-mac-n-cheese.850.jpeg 850w, /lobster-mac-n-cheese.1000.jpeg 1000w, /lobster-mac-n-cheese.1150.jpeg 1150w, /lobster-mac-n-cheese.1300.jpeg 1300w, /lobster-mac-n-cheese.1450.jpeg 1450w, /lobster-mac-n-cheese.1500.jpeg 1500w" sizes="100vw" type="image/jpeg">\n\n<img src="/lobster-mac-n-cheese.jpg" width="1500" height="1500" loading="lazy">\n</picture>';

  plugin.configResolved(Object.assign({ command: 'build' }, resolvedConfig));
  t.is(await plugin.transformIndexHtml(input), expected);
});

test('Basic transforms image HTML on serve', async t => {
  const plugin = imgPlugin();
  const input = '<picture><img src="/lobster-mac-n-cheese.jpg" /></picture>';
  const expected = '<picture><img src="/lobster-mac-n-cheese.jpg" width="1500" height="1500" loading="lazy"></picture>';

  plugin.configResolved(Object.assign({ command: 'serve' }, resolvedConfig));
  t.is(await plugin.transformIndexHtml(input), expected);
});

test('Basic image wrap on serve', async t => {
  const plugin = imgPlugin();
  const input = '<img src="/lobster-mac-n-cheese.jpg" />';
  const expected = '<picture>\n<img src="/lobster-mac-n-cheese.jpg" width="1500" height="1500" loading="lazy">\n</picture>';

  plugin.configResolved(Object.assign({ command: 'serve' }, resolvedConfig));
  t.is(await plugin.transformIndexHtml(input), expected);
});

test('Video wrap on serve', async t => {
  const plugin = imgPlugin();
  const input = '<img class="video" src="/dude.gif" />';
  const expected = '<video class="video" src="/dude.mp4" width="400" height="168" poster="/dude.gif"></video>';

  plugin.configResolved(Object.assign({ command: 'serve' }, resolvedConfig));
  t.is(await plugin.transformIndexHtml(input), expected);
});

test('Video wrap on build', async t => {
  const plugin = imgPlugin();
  const input = '<img class="video" src="/dude.gif" />';
  const expected = '<video class="video" src="/dude.mp4" width="400" height="168" autoplay loop muted playsinline controls>\n<img class="video" src="/dude.gif" width="400" height="168" loading="lazy">\n</video>';

  plugin.configResolved(Object.assign({ command: 'build' }, resolvedConfig));
  t.is(await plugin.transformIndexHtml(input), expected);
});

test.serial('Output video build', async t => {
  const plugin = imgPlugin();
  const input = '<img class="video" src="/dude.gif" />';
  const expected = '<video class="video" src="/dude.mp4" width="400" height="168" autoplay loop muted playsinline controls>\n<img class="video" src="/dude.gif" width="400" height="168" loading="lazy">\n</video>';

  const { config, pth } = generateRandomPath();
  plugin.configResolved(config);
  // Make sure HTML is what we expect
  t.is(await plugin.transformIndexHtml(input), expected);
  // Write the images
  await plugin.writeBundle();

  // Check that what's written are what's expected
  const dir = path.join(config.root, pth);
  const file = await fs.readFile(path.join(dir, 'dude.mp4'));
  const contents = await fs.readdir(dir);

  // The file is an MP4 video
  t.deepEqual(await FileType.fromBuffer(file), { ext: 'mp4', mime: 'video/mp4' });
  t.deepEqual(contents, ['dude.mp4']);

  // Clean up
  await fs.remove(dir);
});

test('Outputs correct images with Sharp', async t => {
  const plugin = imgPlugin({
    optimizer: 'sharp',
    resize: {
      min: 250,
      max: 500,
      step: 100,
    },
  });
  const input = '<img src="/lobster-mac-n-cheese.jpg" />';
  const expected = '<picture>\n<source srcset="/lobster-mac-n-cheese.250.avif 250w, /lobster-mac-n-cheese.350.avif 350w, /lobster-mac-n-cheese.450.avif 450w, /lobster-mac-n-cheese.500.avif 500w" sizes="100vw" type="image/avif">\n\n<source srcset="/lobster-mac-n-cheese.250.webp 250w, /lobster-mac-n-cheese.350.webp 350w, /lobster-mac-n-cheese.450.webp 450w, /lobster-mac-n-cheese.500.webp 500w" sizes="100vw" type="image/webp">\n\n<source srcset="/lobster-mac-n-cheese.250.jpeg 250w, /lobster-mac-n-cheese.350.jpeg 350w, /lobster-mac-n-cheese.450.jpeg 450w, /lobster-mac-n-cheese.500.jpeg 500w" sizes="100vw" type="image/jpeg">\n\n<img src="/lobster-mac-n-cheese.jpg" width="500" height="500" loading="lazy">\n</picture>';

  const { config, pth } = generateRandomPath();
  plugin.configResolved(config);
  // Make sure HTML is what we expect
  t.is(await plugin.transformIndexHtml(input), expected);
  // Write the images
  await plugin.writeBundle();

  // Check that what's written are what's expected
  const dir = path.join(config.root, pth);
  // const file = await fs.readFile(path.join(dir, 'dude.mp4'));
  const contents = await fs.readdir(dir);
  const files = await Promise.all(
    contents.map(async file => ({
      file,
      buffer: await fs.readFile(path.join(dir, file)),
    })),
  );

  for (const file of files) {
    switch (path.extname(file.file)) {
      case '.avif':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'avif', mime: 'image/avif' });
        break;
      case '.webp':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'webp', mime: 'image/webp' });
        break;
      case '.jpeg':
      case '.jpg':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'jpg', mime: 'image/jpeg' });
        break;
      case '.png':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'png', mime: 'image/png' });
        break;
    }
  }

  t.deepEqual(contents, ['lobster-mac-n-cheese.250.avif', 'lobster-mac-n-cheese.250.jpeg', 'lobster-mac-n-cheese.250.webp', 'lobster-mac-n-cheese.350.avif', 'lobster-mac-n-cheese.350.jpeg', 'lobster-mac-n-cheese.350.webp', 'lobster-mac-n-cheese.450.avif', 'lobster-mac-n-cheese.450.jpeg', 'lobster-mac-n-cheese.450.webp', 'lobster-mac-n-cheese.500.avif', 'lobster-mac-n-cheese.500.jpeg', 'lobster-mac-n-cheese.500.webp']);

  // Clean up
  await fs.remove(dir);
});

test('Outputs correct images with Squoosh', async t => {
  const plugin = imgPlugin({
    optimizer: 'squoosh',
    resize: {
      min: 250,
      max: 500,
      step: 100,
    },
  });
  const input = '<img src="/lobster-mac-n-cheese.jpg" />';
  const expected = '<picture>\n<source srcset="/lobster-mac-n-cheese.250.avif 250w, /lobster-mac-n-cheese.350.avif 350w, /lobster-mac-n-cheese.450.avif 450w, /lobster-mac-n-cheese.500.avif 500w" sizes="100vw" type="image/avif">\n\n<source srcset="/lobster-mac-n-cheese.250.webp 250w, /lobster-mac-n-cheese.350.webp 350w, /lobster-mac-n-cheese.450.webp 450w, /lobster-mac-n-cheese.500.webp 500w" sizes="100vw" type="image/webp">\n\n<source srcset="/lobster-mac-n-cheese.250.jpeg 250w, /lobster-mac-n-cheese.350.jpeg 350w, /lobster-mac-n-cheese.450.jpeg 450w, /lobster-mac-n-cheese.500.jpeg 500w" sizes="100vw" type="image/jpeg">\n\n<img src="/lobster-mac-n-cheese.jpg" width="500" height="500" loading="lazy">\n</picture>';

  const { config, pth } = generateRandomPath();
  plugin.configResolved(config);
  // Make sure HTML is what we expect
  t.is(await plugin.transformIndexHtml(input), expected);
  // Write the images
  await plugin.writeBundle();

  // Check that what's written are what's expected
  const dir = path.join(config.root, pth);
  // const file = await fs.readFile(path.join(dir, 'dude.mp4'));
  const contents = await fs.readdir(dir);
  const files = await Promise.all(
    contents.map(async file => ({
      file,
      buffer: await fs.readFile(path.join(dir, file)),
    })),
  );

  for (const file of files) {
    switch (path.extname(file.file)) {
      case '.avif':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'avif', mime: 'image/avif' });
        break;
      case '.webp':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'webp', mime: 'image/webp' });
        break;
      case '.jpeg':
      case '.jpg':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'jpg', mime: 'image/jpeg' });
        break;
      case '.png':
        t.deepEqual(await FileType.fromBuffer(file.buffer), { ext: 'png', mime: 'image/png' });
        break;
    }
  }

  t.deepEqual(contents, ['lobster-mac-n-cheese.250.avif', 'lobster-mac-n-cheese.250.jpeg', 'lobster-mac-n-cheese.250.webp', 'lobster-mac-n-cheese.350.avif', 'lobster-mac-n-cheese.350.jpeg', 'lobster-mac-n-cheese.350.webp', 'lobster-mac-n-cheese.450.avif', 'lobster-mac-n-cheese.450.jpeg', 'lobster-mac-n-cheese.450.webp', 'lobster-mac-n-cheese.500.avif', 'lobster-mac-n-cheese.500.jpeg', 'lobster-mac-n-cheese.500.webp']);

  // Clean up
  await fs.remove(dir);
});
