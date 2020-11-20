# Eleventy Plugin Local Responsive Images

[Eleventy plugin](https://www.11ty.dev/docs/plugins/) for resizing and optimizing local images, and rewriting `img` tags to make use of the resized and optimized images (collectively, "responsive images"). Works by finding local images in `img` tags that aren't already wrapped in a `picture` tag and, where applicable, resizing, optimizing, and converting to [`webp`](https://developers.google.com/speed/webp). Can take a glob of additional images to watch and optimize as well. Additional images will not be resized or have a WebP version made.

Supported image types:

- _png_ - optimize/resize/webp
- _jpg_ - optimize/resize/webp
- _gif_ - optimize/resize/webp/mp4
- _svg_ - optimize

## Usage

```js
const pluginLocalRespimg = require('eleventy-plugin-local-respimg');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginLocalRespimg, {
    folders: {
      source: 'src', // Folder images are stored in
      output: 'public', // Folder images should be output to
    },
    images: {
      resize: {
        min: 250, // Minimum width to resize an image to
        max: 1500, // Maximum width to resize an image to
        step: 150, // Width difference between each resized image
      },
      hoistClasses: false, // Adds the image tag's classes to the output picture tag
      gifToVideo: false, // Convert GIFs to MP4 videos
      sizes: '100vw', // Default image `sizes` attribute
      lazy: true, // Include `loading="lazy"` attribute for images
      additional: [
        // Globs of additional images to optimize (won't be resized)
        'images/icons/**/*',
      ],
      watch: {
        src: 'images/**/*', // Glob of images that Eleventy should watch for changes to
      },
      pngquant: {
        /* ... */
      }, // imagemin-pngquant options
      mozjpeg: {
        /* ... */
      }, // imagemin-mozjpeg options
      svgo: {
        /* ... */
      }, // imagemin-svgo options
      gifresize: {
        /* ... */
      }, // @gumlet/gif-resize options
      webp: {
        /* ... */
      }, // imagemin-webp options
      gifwebp: {
        /* ... */
      }, // imagemin-gif2webp options
    },
  });
};
```
