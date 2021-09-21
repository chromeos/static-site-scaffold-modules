# Vite Plugin Img

A [Vite](https://vitejs.dev/) plugin to transform images in your HTML. For images, creates [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images) by cutting images at different sizes and formats. For `gif`s, transforms them into videos.

## Installation

First, install from NPM:

```bash
$ npm install vite-plugin-img --save-dev
```

Then, include the plugin in your Vite config:

```js
const { imgPlugin } = require('vite-plugin-img');

module.exports = {
  plugins: [imgPlugin()],
};
```

## Usage

Images should be stored in, and referenced from, your Vite [`public` directory](https://vitejs.dev/guide/assets.html#the-public-directory). Then, write standard `img` tags referencing the images you want! As long as the `img` tag is in the rendered HTML, this plugin will pick it up and update it!

## Options

The following options are available:

- `formats` - The formats to include
  - `formats.avif` - Whether to output [AVIF](https://jakearchibald.com/2020/avif-has-landed/) images. Boolean, defaults to `true`
  - `formats.webp` - Whether to output [WebP](https://developers.google.com/speed/webp) images. Boolean, defaults to `true`
- `resize` - Image resize options. Images won't be upscaled, and are based on image width
  - `resize.min` - Smallest image width to cut, in pixels. Number, defaults to `250`
  - `resize.max` - Largest image width to cut, in pixels. Number, defaults to `1500`
  - `resize.step` - Difference, in pixels, between the width of each image cut. Number, defaults to `150`.
- `wrapSVG` - Whether or not to wrap SVGs in `picture` elements. Boolean, defaults to `false`
- `attrs` - Array of attribute names to include in wrapped `picture` element from the wrapping `img` tag. Defaults to `['class']`
- `sizes` - Default [`sizes`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes) attribute, if one isn't available. Defaults to `100vw`
- `lazy` - Whether to lazyload images using the [`loading`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-loading) attribute. Boolean, defaults to `true`
- `optimizer` - Which image optimizer to use, `sharp` or `squoosh`. Sharp is faster, but results in larger file sizes. Squoosh is slower, but results in smaller file sizes. Performance is only affected on build, not during dev. Defaults to `squoosh`.
