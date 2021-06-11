const test = require('ava')
const plugin = require('../lib')
const posthtml = require('posthtml')

const path = require('path')
const {readFileSync} = require('fs')

const fixture = file => readFileSync(path.join(__dirname, 'fixtures', `${file}.html`), 'utf8')
const expected = file => readFileSync(path.join(__dirname, 'expected', `${file}.html`), 'utf8')

// eslint-disable-next-line
const error = (name, options, cb) => posthtml([plugin(options)]).process(fixture(name)).catch(cb)
const clean = html => html.replace(/[^\S\r\n]+$/gm, '').trim()

const process = (t, name, options, log = false) => {
  return posthtml([plugin(options)])
    .process(fixture(name))
    .then(result => log ? console.log(result.html) : clean(result.html))
    .then(html => t.is(html, expected(name).trim()))
}

test('Basic', t => {
  return process(t, 'basic')
})
