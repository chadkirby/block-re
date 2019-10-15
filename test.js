const test = require('tape');
const BLOCKRE = require('./index');

test(`blockRE works`, (assert) => {
  const re = BLOCKRE();
  assert.ok(re`` instanceof RegExp);
  assert.equal(re`a`.source, `a`);
  assert.ok(re`a`.test('abc'));
  assert.end();
});

test(`blockRE accepts flags`, (assert) => {
  assert.equal(BLOCKRE()``.flags, ``);
  assert.equal(BLOCKRE('g')``.flags, `g`);
  assert.equal(BLOCKRE('i')``.flags, `i`);
  assert.equal(BLOCKRE('m')``.flags, `m`);
  assert.equal(BLOCKRE('gim')``.flags, `gim`);
  assert.end();
});

test(`blockRE ignores whitespace`, (assert) => {
  const re = BLOCKRE();
  assert.equal(re`a b c`.source, `abc`);
  assert.ok(re`
    a
    b
    c
  `.test('abc'));
  assert.end();
});

test(`blockRE ignores comments`, (assert) => {
  const re = BLOCKRE();
  assert.equal(re`
    a // match a literal 'a'
  `.source, `a`);
  assert.ok(re`
    a // match a literal 'a'
    b // match a literal 'b'
    c // match a literal 'c'
  `.test('abc'));
  assert.end();
});

test(`blockRE doesn't require escaping special chars`, (assert) => {
  const re = BLOCKRE();
  assert.equal(re`\d`.source, `\\d`);
  assert.ok(re`\w{3}`.test('abc'));
  assert.end();
});

test(`blockRE does substitutions`, (assert) => {
  const re = BLOCKRE();
  const A = /[aA]/;
  assert.equal(re`${A}${'bc'}`.source, `[aA]bc`);
  assert.ok(re`${A}${'bc'}`.test('abc'));
  assert.end();
});

test(`blockRE escapes string substitutions, not regex substitutions`, (assert) => {
  const re = BLOCKRE();
  const A = /[aA]/; // inserted as regex
  const B = `[bB]`; // inserted as escaped string
  assert.equal(re`${A}${B}`.source, `[aA]\\[bB\\]`);

  const C = /[\w\W]/;
  assert.equal(
    re`${C}${C.source}`.source,
    `[\\w\\W]\\[\\\\w\\\\W\\]`
  );

  assert.equal(
    BLOCKRE({ escapeTest: false })`${C}${C.source}`.source,
    `[\\w\\W][\\w\\W]`
  );
  assert.end();
});
