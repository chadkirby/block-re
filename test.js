const test = require('tape');
const RE = require('./index');

test(`blockRE works`, (assert) => {
  const re = RE();
  assert.ok(re`` instanceof RegExp);
  assert.equal(re`a`.source, `a`);
  assert.ok(re`a`.test('abc'));
  assert.end();
});

test(`blockRE accepts flags`, (assert) => {
  assert.equal(RE()``.flags, ``);
  assert.equal(RE('g')``.flags, `g`);
  assert.equal(RE('i')``.flags, `i`);
  assert.equal(RE('m')``.flags, `m`);
  assert.equal(RE('gim')``.flags, `gim`);
  assert.end();
});

test(`blockRE ignores whitespace`, (assert) => {
  const re = RE();
  assert.equal(re`a b c`.source, `abc`);
  assert.ok(re`
    a
    b
    c
  `.test('abc'));
  assert.equal(
    re`a\ *b\ *c`.source,
    `a\\ *b\\ *c`,
    `escaped whitespace is honored`
  );
  assert.end();
});

test(`blockRE ignores comments`, (assert) => {
  const re = RE();
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
  const re = RE();
  assert.equal(re`\d`.source, `\\d`);
  assert.ok(re`\w{3}`.test('abc'));
  assert.end();
});

test(`blockRE does substitutions`, (assert) => {
  const re = RE();
  const A = /a/;
  assert.equal(re`${A}${'b'}c`.source, `abc`);
  assert.ok(re`\s*${A}${'bc'}`.test('abc'));
  assert.end();
});

test(`blockRE escapes string substitutions, not regex substitutions`, (assert) => {
  const re = RE();
  const A = /[aA]/; // inserted as regex
  const B = `[bB]`; // inserted as escaped string
  assert.equal(re`${A}${B}`.source, `[aA]\\[bB\\]`);

  const C = /[\w\W]/;
  assert.equal(
    re`${C}${C.source}`.source,
    `[\\w\\W]\\[\\\\w\\\\W\\]`
  );

  assert.equal(
    RE('', { escapeText: false })`${C}${C.source}`.source,
    `[\\w\\W][\\w\\W]`
  );
  assert.equal(
    RE({ escapeText: false })`${C}${C.source}`.source,
    `[\\w\\W][\\w\\W]`
  );
  assert.end();
});

test(`BLOCKRE accepts regex literal syntax`, (assert) => {
  assert.equal(RE`/x/g`.source, `x`);
  assert.equal(RE`/
    y // match 'y'
  /g`.source, `y`);
  assert.equal(RE`/x/g`.flags, `g`);
  assert.equal(RE`/x/suygim`.flags, `gimsuy`);
  assert.equal(RE`/ a ${'b'} ${/c/} /`.source, `abc`);
  assert.equal(RE`/ ${/[a]/} /`.source, `[a]`);
  assert.equal(
    RE`/ ${/[a]\d{1}/.source} /`.source,
    `[a]\\d{1}`,
    `don't escape text by default`
  );
  assert.equal(
    RE`/ ${/[a]\d{1}/.source} /e`.source,
    `\\[a\\]\\\\d\\{1\\}`,
    `'e' flag opts in to escape text in substitutions`
  );
  assert.end();
});
