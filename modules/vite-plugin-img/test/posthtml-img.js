const test = require('ava');
const plugin = require('../lib/posthtml-img');
const posthtml = require('posthtml');
const path = require('path');

const options = {
  formats: {
    avif: true,
    webp: true,
  },
  resize: {
    min: 250,
    max: 1500,
    step: 150,
  },
  wrapSVG: false, // Whether to wrap SVG in Picture element
  attrs: ['class'], // Attributes to include on picture element from img
  gifToVideo: true, // Still need to build this out
  sizes: '100vw',
  lazy: true,
  optimizer: 'squoosh', // squoosh or sharp
  build: true,
  dirs: {
    root: path.join(__dirname, 'fixtures'),
    out: path.join(__dirname, 'fixtures/out'),
    cache: path.join(__dirname, '../.cache/images'),
  },
};

test('Add sources to images in pictures', async t => {
  const input = '<picture><img src="/lobster-mac-n-cheese.jpg" /></picture>';
  const expected = '<picture>\n<source srcset="/lobster-mac-n-cheese.250.avif 250w, /lobster-mac-n-cheese.400.avif 400w, /lobster-mac-n-cheese.550.avif 550w, /lobster-mac-n-cheese.700.avif 700w, /lobster-mac-n-cheese.850.avif 850w, /lobster-mac-n-cheese.1000.avif 1000w, /lobster-mac-n-cheese.1150.avif 1150w, /lobster-mac-n-cheese.1300.avif 1300w, /lobster-mac-n-cheese.1450.avif 1450w, /lobster-mac-n-cheese.1500.avif 1500w" sizes="100vw" type="image/avif">\n\n<source srcset="/lobster-mac-n-cheese.250.webp 250w, /lobster-mac-n-cheese.400.webp 400w, /lobster-mac-n-cheese.550.webp 550w, /lobster-mac-n-cheese.700.webp 700w, /lobster-mac-n-cheese.850.webp 850w, /lobster-mac-n-cheese.1000.webp 1000w, /lobster-mac-n-cheese.1150.webp 1150w, /lobster-mac-n-cheese.1300.webp 1300w, /lobster-mac-n-cheese.1450.webp 1450w, /lobster-mac-n-cheese.1500.webp 1500w" sizes="100vw" type="image/webp">\n\n<source srcset="/lobster-mac-n-cheese.250.jpeg 250w, /lobster-mac-n-cheese.400.jpeg 400w, /lobster-mac-n-cheese.550.jpeg 550w, /lobster-mac-n-cheese.700.jpeg 700w, /lobster-mac-n-cheese.850.jpeg 850w, /lobster-mac-n-cheese.1000.jpeg 1000w, /lobster-mac-n-cheese.1150.jpeg 1150w, /lobster-mac-n-cheese.1300.jpeg 1300w, /lobster-mac-n-cheese.1450.jpeg 1450w, /lobster-mac-n-cheese.1500.jpeg 1500w" sizes="100vw" type="image/jpeg">\n<img src="/lobster-mac-n-cheese.jpg" width="1500" height="1500" loading="lazy"></picture>';
  let images = [];
  const { html: output } = await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });
  t.is(output, expected);

  images = images.flat();

  const { html: output2 } = await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });

  images = images.flat();

  t.is(output2, expected);
  t.is(images.length, 2);
  t.is(images[1], images[0]);
});

test('Image Results', async t => {
  const input = '<picture><img src="/lobster-mac-n-cheese.jpg" /></picture>';
  let images = [];
  await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });
  const outputImage = images[0][0];
  t.deepEqual(Object.keys(outputImage), ['src', 'format', 'sharp', 'sizes', 'attrs', 'formats']);
  t.deepEqual(outputImage.sizes, [250, 400, 550, 700, 850, 1000, 1150, 1300, 1450, 1500]);
  t.deepEqual(outputImage.attrs, { width: 1500, height: 1500 });
  t.deepEqual(outputImage.formats, ['avif', 'webp', 'jpeg']);
  t.is(outputImage.format, 'jpeg');
  t.is(outputImage.src, '/lobster-mac-n-cheese.jpg');
  t.is(outputImage.sharp.constructor.name, 'Sharp');
});

test('Ignore pictures with source sets', async t => {
  const input = '<picture><source srcset="/lobster-mac-n-cheese.1500.avif 1500w" sizes="100vw" type="image/avif"><img src="/lobster-mac-n-cheese.jpg"></picture>';
  const expected = '<picture><source srcset="/lobster-mac-n-cheese.1500.avif 1500w" sizes="100vw" type="image/avif"><img src="/lobster-mac-n-cheese.jpg"></picture>';
  const images = [];
  const { html: output } = await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});

test('GIFs', async t => {
  const input = '<img src="/dude.gif" />';
  const expected = '<video src="/dude.mp4" width="400" height="168" autoplay loop muted playsinline controls>\n<img src="/dude.gif" width="400" height="168" loading="lazy">\n</video>';
  const images = [];
  const { html: output } = await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});

test('SVGs: no wrap', async t => {
  const input = '<img src="/face.svg" />';
  const expected = '<img src="/face.svg" width="500" height="500" loading="lazy">';
  const images = [];
  const { html: output } = await posthtml([plugin(images, options)]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});

test('SVGs: wrap', async t => {
  const input = '<img src="/face.svg" />';
  const expected = '<picture>\n<img src="/face.svg" width="500" height="500" loading="lazy">\n</picture>';
  const images = [];
  const { html: output } = await posthtml([
    plugin(
      images,
      Object.assign(
        { ...options },
        {
          wrapSVG: true,
        },
      ),
    ),
  ]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});

test('Hoist attributes', async t => {
  const input = '<img class="foo" src="/face.svg" />';
  const expected = '<picture class="foo">\n<img class="foo" src="/face.svg" width="500" height="500" loading="lazy">\n</picture>';
  const images = [];
  const { html: output } = await posthtml([
    plugin(
      images,
      Object.assign(
        { ...options },
        {
          wrapSVG: true,
        },
      ),
    ),
  ]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});

test('Static images', async t => {
  const input = '<img src="/lobster-mac-n-cheese.jpg" />';
  const expected = '<picture>\n<source srcset="/lobster-mac-n-cheese.250.avif 250w, /lobster-mac-n-cheese.400.avif 400w, /lobster-mac-n-cheese.550.avif 550w, /lobster-mac-n-cheese.700.avif 700w, /lobster-mac-n-cheese.850.avif 850w, /lobster-mac-n-cheese.1000.avif 1000w, /lobster-mac-n-cheese.1150.avif 1150w, /lobster-mac-n-cheese.1300.avif 1300w, /lobster-mac-n-cheese.1450.avif 1450w, /lobster-mac-n-cheese.1500.avif 1500w" sizes="100vw" type="image/avif">\n\n<source srcset="/lobster-mac-n-cheese.250.webp 250w, /lobster-mac-n-cheese.400.webp 400w, /lobster-mac-n-cheese.550.webp 550w, /lobster-mac-n-cheese.700.webp 700w, /lobster-mac-n-cheese.850.webp 850w, /lobster-mac-n-cheese.1000.webp 1000w, /lobster-mac-n-cheese.1150.webp 1150w, /lobster-mac-n-cheese.1300.webp 1300w, /lobster-mac-n-cheese.1450.webp 1450w, /lobster-mac-n-cheese.1500.webp 1500w" sizes="100vw" type="image/webp">\n\n<source srcset="/lobster-mac-n-cheese.250.jpeg 250w, /lobster-mac-n-cheese.400.jpeg 400w, /lobster-mac-n-cheese.550.jpeg 550w, /lobster-mac-n-cheese.700.jpeg 700w, /lobster-mac-n-cheese.850.jpeg 850w, /lobster-mac-n-cheese.1000.jpeg 1000w, /lobster-mac-n-cheese.1150.jpeg 1150w, /lobster-mac-n-cheese.1300.jpeg 1300w, /lobster-mac-n-cheese.1450.jpeg 1450w, /lobster-mac-n-cheese.1500.jpeg 1500w" sizes="100vw" type="image/jpeg">\n\n<img src="/lobster-mac-n-cheese.jpg" width="1500" height="1500" loading="lazy">\n</picture>';
  const images = [];
  const { html: output } = await posthtml([plugin(images, options, {})]).process(input, {
    sync: false,
  });
  t.is(output, expected);
});
