# Markdown It Figure

[Markdown-It](https://markdown-it.github.io/) plugin that allows you to add [`<figure>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)s with [`<figcaption>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figcaption)s to your Markdown.

## Usage

### Markdown-It Config

```js
const markdown = require('markdown-it');

const md = markdown({
  /* ... markdown-it options */
}).use(require('markdown-it-figure'));
```

### Markdown

- `#[Caption](/url/to/image.png)` - Basic figure. Outputs `<figure><img src="/url/to/image.png"><figcaption>Caption</figcaption></figure>`
- `#1234[Caption](/url/to/image.png [Alt Text])` - Advanced figure, including a figure number and alt text for image. Outputs `figure id="figure-1234"><img src="/images/foo.png" alt="Alt Text"/><figcaption><p><span class="figure-id">1234: </span>Caption</p></figcaption></figure>`
