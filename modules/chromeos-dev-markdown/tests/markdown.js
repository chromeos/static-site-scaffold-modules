const test = require('ava');
const md = require('../index.js');

test('Renders fences with titles', t => {
  const content = `
\`\`\`javascript {title="Hello World" .foo .bar #baz}
const a = 1;
\`\`\``;
  const output = md.render(content);
  const expected = `<figure class="foo bar" id="baz"><figcaption>Hello World</figcaption><pre class="language-javascript"><code class="language-javascript"><span class="token keyword">const</span> a <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
</code></pre></figure>`;

  t.is(output, expected);
});

test('Renders unknown languages', t => {
  const content = `
\`\`\`
const a = 1;
\`\`\``;
  const output = md.render(content);
  const expected = `<figure><pre class="language-unknown"><code class="language-unknown">const a = 1;
</code></pre></figure>`;

  t.is(output, expected);
});

test('Renders blockquotes with citations without carrying over to next blockquote', t => {
  const content = `> This is such a quote.
  >
  > And some more of this quote
  {.foo cite="Banana bob"}
  
  > Another Blockquote`;
  const output = md.render(content);
  const expected = `<blockquote class="foo"><p>This is such a quote.</p>
<p>And some more of this quote</p>
<footer>Banana bob</footer></blockquote><blockquote><p>Another Blockquote</p>
</blockquote>`;

  t.is(output, expected);
});

test('Renders headers with unicode, ids, and sections', t => {
  const content = `# Hélløoö 🌎 Test
This is some content`;
  const output = md.render(content);
  const expected = `<section>
<h1 id="hélløoö-test" tabindex="-1"><a class="header-anchor" href="#hélløoö-test">Hélløoö 🌎 Test</a></h1>
<p>This is some content</p>
</section>
`;

  t.is(output, expected);
});

test('Emmet Containers', t => {
  const content = `!!! aside.message.message--alert
**Alert**: This is an alert message
!!!`;
  const output = md.render(content);
  const expected = `<aside class="message message--alert"><p><strong>Alert</strong>: This is an alert message</p>
</aside>`;

  t.is(output, expected);
});
