import test from 'ava';
import markdown from 'markdown-it';
import figurePlugin from '../index.js';

const md = markdown({ html: true, linkify: true }).use(figurePlugin);

test('ALl the bells and whistles', t => {
  const input = '#1234[Look At This Caption](/images/foo.png [Foo Bar])';
  const output = '<p><figure id="figure-1234"><img src="/images/foo.png" alt="Foo Bar"/><figcaption><p><span class="figure-id">1234: </span>Look At This Caption</p></figcaption></figure></p>\n';

  t.is(md.render(input), output);
});
