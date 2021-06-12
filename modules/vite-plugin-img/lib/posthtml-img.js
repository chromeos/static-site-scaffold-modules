const sharp = require('sharp');
const replaceExt = require('replace-ext');
const path = require('path');

// INTERESTING THOUGHTS
// With a Vite plugin, can this only run on the current HTML file being worked on? Would that drastically reduce the performance overhead?
//    The answer appears to be "yes"
// Can the image changes be globally memoized so we can keep we don't need to compile it multiple times?
//    Yes
// Can we do all of this through buffers and inlining so we don't need to generate on-disc files?
//    Or, do we throw stuff into an invisible cache?! Look into Vite Build to figure out how "public" stuff gets moved over
//    Eleventy Cache does some nifty stuff with external assets; look into that too
//    Also need a more reliable way to generate a path to the assets. Vite makes this pretty straight forward; root/public (public dir)
//    How will this work with https://vitejs.dev/guide/build.html#public-base-path?
//    https://vitejs.dev/config/#publicdir - Public Directory path
//    https://vitejs.dev/config/#cachedir - Cache Directory path
//    Maybe this happens
// Can we optimize picture sources without changing the actual source stuff?
// What about CSS?
// New blog post on FFMpeg across platforms: https://puruvj.dev/blog/gif-to-mp4-ffmpeg-fluent-web
// Image transforms are _slow_. Maybe only run them on build?

// NEW INTERESTING THOUGHTS
// * WIth vite-plugin-posthtml, this can be run on only the HTML image being worked on
// * Can maintain a memoized cache so images from different pages can re-use what's already been done
// * Figure out a way to cache images into a cache directory and pull in with @fs/ so we don't need to pollute public directory
//    * Maybe we don't need to cache? https://www.11ty.dev/docs/plugins/cache/#options may be able to handle this for us, or maybe use that to automatically cache the remote images
//    * Maybe this is a config option? Cache dir and cache prefix?
//    * https://vitejs.dev/config/#publicdir - Public Directory path
//    * https://vitejs.dev/config/#cachedir - Cache Directory path
// * Need Output Dir folder to write final cuts to
// * Have a command that can be run to pull external images into cache
// * Need render, cache, and process methods
//  * Cache will pull, process will change HTML, and render will render images?

/**
 *
 * @param {number[]} sizes - Array of widths in px
 * @param {string} src - image source url
 * @param {string} type - file extension
 *
 * @return {string[]}
 */
function generateSrcset(sizes, src, type) {
  return sizes.map((s) => `${replaceExt(src, `.${s}.${type}`)} ${s}w`).join(', ');
}

/**
 *
 * @param {string[]} allImages - Array of all images
 * @param {object} command - Eleventy command info
 * @param {Object} opts - Options
 * @return {Function}
 */
function postHTMLImg(allImages, command, opts = {}) {
  const options = Object.assign(
    {
      formats: {
        png: ['avif', 'webp', 'png'],
        jpeg: ['avif', 'webp', 'jpeg'],
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
    },
    opts,
  );

  /**
   *
   * @param {PostHTMLAST} tree - PostHTML Tree
   * @return {PostHTMLAST}
   */
  return async function process(tree) {
    const attrs = {};
    if (options.lazy) {
      attrs.loading = 'lazy';
    }

    let images = [];

    tree.match({ tag: 'picture' }, (node) => {
      // Check for sources
      const source = node.content.filter((f) => f.tag === 'source');

      node.content = node.content.map((n) => {
        if (n?.tag === 'img') {
          n.inPicture = true;

          // Image has sources already, don't override
          if (source.length) {
            n.hasSources = true;
          } else {
            n.hasSources = false;
          }
        }

        return n;
      });

      return node;
    });

    // Grab images without sources already
    tree.match({ tag: 'img' }, (node) => {
      if (!node.hasSources && !images.includes(node.attrs.src)) {
        images.push(node.attrs.src);
      }

      return node;
    });

    images = await Promise.all(
      images.map(async (src) => {
        let source = src;
        if (src.startsWith(options.externalPrefix)) {
          source = src.replace(options.externalPrefix, '');
        }

        const img = await sharp(path.join(command.dirs.root, source), {
          failOnError: false,
        });

        const metadata = await img.metadata();

        const sizes = [];
        let width = metadata.width;
        let height = metadata.height;

        if (metadata.format !== 'svg') {
          // Calculate sizes
          const { step, min, max } = options.resize;
          const genMax = max < metadata.width ? max : metadata.width;
          width = genMax;
          height = Math.round((genMax / metadata.width) * metadata.height);

          if (min + step <= metadata.width) {
            for (let i = min; i < genMax; i += step) {
              sizes.push(i);
            }
          }
          sizes.push(genMax);
        } else {
          sizes.push(metadata.width);
        }

        let formats = [];

        if (metadata.format === 'svg') {
          formats.push('svg');
        } else if (metadata.format === 'gif') {
          formats.push('gif');
        } else {
          formats = options.formats[metadata.format];
        }

        return {
          src,
          format: metadata.format,
          sharp: img,
          sizes,
          attrs: {
            width,
            height,
          },
          formats,
        };
      }),
    );

    allImages.push(images);

    // Update images
    tree.match({ tag: 'img' }, (node) => {

      // Only operate if the image is stand-alone or doesn't have sources
      if (
        (!node.inPicture || (node.inPicture && !node.hasSources)) &&
        node.respImgTransform !== true
      ) {
        const img = images.find((i) => i.src === node.attrs.src);

        if (!img) return node;

        node.attrs = Object.assign(node.attrs, img.attrs);

        if (options.lazy) {
          node.attrs.loading = 'lazy';
        }

        // Mark this image as having been transformed
        node.respImgTransform = true;

        if (img.format === 'gif') {
          const videoAttrs = Object.assign({}, node.attrs);
          if (videoAttrs.loading) {
            delete videoAttrs.loading;
          }

          const videoSrc = replaceExt(videoAttrs.src, '.mp4');

          return {
            tag: 'video',
            content: ['\n', node, '\n'],
            attrs: Object.assign(videoAttrs, {
              autoplay: true,
              loop: true,
              muted: true,
              playsinline: true,
              controls: true,
              src: videoSrc,
            })
          }
        }

        const respSizes = node.attrs.sizes || options.sizes;

        if (img.format !== 'svg' && img.format !== 'gif' && command.build) {
          node.respImgSources = img.formats.map((f) => [
            '\n',
            {
              tag: 'source',
              attrs: {
                srcset: generateSrcset(img.sizes, img.src, f),
                sizes: respSizes,
                type: `image/${f}`,
              },
            },
            '\n',
          ]);
        }

        if (
          (!node.inPicture && img.format === 'svg' && options.wrapSVG) ||
          (img.format !== 'svg' && img.format !== 'gif')
        ) {
          // Grab image attributes for the picture element!
          const attrs = Object.fromEntries(
            Object.entries(node.attrs).filter(([key, val]) => options.attrs.includes(key)),
          );
          // Stick it in a picture!
          node = {
            tag: 'picture',
            content: ['\n', node, '\n'],
            attrs,
          };
        }
      }

      return node;
    });

    // Build the picture sources!
    tree.match({ tag: 'picture' }, (node) => {
      const img = node.content.find((f) => Object.keys(f).includes('respImgSources'));
      if (img) {
        node.content = img.respImgSources.concat(node.content).flat();
      }

      return node;
    });

    return tree;
  };
}

module.exports = postHTMLImg;
