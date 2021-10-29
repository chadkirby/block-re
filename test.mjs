import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const test = require('tape');
import re from './dist/block-re.js';

test(`blockRE works`, (assert) => {
  assert.ok(re`` instanceof RegExp);
  assert.equal(re`a`.source, `a`);
  assert.ok(re`a`.test('abc'));
  assert.end();
});

test(`blockRE accepts flags`, (assert) => {
  assert.equal(re``.flags, ``);
  assert.equal(re`/x/g`.flags, `g`);
  assert.equal(re`/x/i`.flags, `i`);
  assert.equal(re`/x/m`.flags, `m`);
  assert.equal(re`/x/gim`.flags, `gim`);
  assert.end();
});

test(`blockRE ignores whitespace`, (assert) => {
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
  assert.equal(re`\d`.source, `\\d`);
  assert.ok(re`\w{3}`.test('abc'));
  assert.end();
});

test(`blockRE does substitutions`, (assert) => {
  const A = /a/;
  const zero = 0;
  assert.equal(re`${A}${'b'}c`.source, `abc`);
  assert.ok(re`\s*${A}${'b'}c`.test('abc'));
  assert.equal(re`${A}${zero}c`.source, `a0c`);
  assert.end();
});

test(`blockRE escapes string substitutions, not regex substitutions`, (assert) => {
  const A = /[aA]/; // inserted as regex
  const B = `[bB]`; // inserted as escaped string
  assert.equal(re`/${A}${B}/E`.source, `[aA]\\[bB\\]`);
  assert.equal(re`/${A}${B}/`.source, `[aA][bB]`);

  const C = /[\w\W]/;
  assert.equal(
    re`/${C}${C.source}/E`.source,
    `[\\w\\W]\\[\\\\w\\\\W\\]`
  );

  assert.end();
});

test(`BLOCKRE accepts regex literal syntax`, (assert) => {
  assert.equal(re`/x/g`.source, `x`);
  assert.equal(re`x`.source, `x`);
  assert.equal(re`/
    y // match 'y'
  /g`.source, `y`);
  assert.equal(re`/x/g`.flags, `g`);
  assert.equal(re`x`.flags, ``);
  assert.equal(re`/x/suygim`.flags, `gimsuy`);
  assert.equal(re`/ a ${'b'} ${/c/} /`.source, `abc`);
  assert.equal(re`/ ${/[a]/} /`.source, `[a]`);
  assert.equal(
    re`/ ${/[a]\d{1}/.source} /`.source,
    `[a]\\d{1}`,
    `don't escape text by default`
  );
  assert.equal(
    re`/ ${/[a]\d{1}/.source} /E`.source,
    `\\[a\\]\\\\d\\{1\\}`,
    `'E' flag opts in to escape text in substitutions`
  );

  assert.deepEqual(
    Object.assign({}, re`/
      (?<${'first'}> . )
      (${'?<second>'} . )
      ${'(?<third>.)'}
    /`.exec('abc').groups),
    { first: `a`, second: `b`, third: `c` },
    `named capture groups FTW`
  );
  assert.end();
});
