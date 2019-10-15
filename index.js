// coffeescript block regular expressions are awesome http://coffeescript.org/#regexes
// > Similar to block strings… CoffeeScript supports block regexes — extended regular
// > expressions that ignore internal whitespace and can contain comments and interpolation.
// > Modeled after Perl's /x modifier… block regexes… go a long way towards making complex
// > regular expressions readable.
// I would like me some of that in ES6
// unlike the other tag processors, blockRE is a function that takes options
// and returns the tag processor fn.
// so, blockRE()`( a )` gives you /(a)/
// NB, in the chrome debugger, you have to assign the tag processor fn to a value before you can use it
// re = blockRE('g'); re`( a )`;
// gives you /a/g
function blockRE(...args) {
  let escapeText;
  let flags;
  let options;

  // check whether this function is being used directly as a tag function
  if (args[0] && Array.isArray(args[0]) && args[0].raw) {
    escapeText = false;
    // in this mode, the raw literals may have literal RegExp slashes & trailing
    // flags
    let [ literals, ...cookedValues ] = args;
    // make an unfrozen copy of the raw literals
    let raw = literals.raw.slice();
    let last = raw[raw.length - 1];
    let trailing = last.match(/[/][gimsuye]*$/);
    if (raw[0].startsWith('/') && trailing) {
      // the tagged string has literal RegExp syntax
      // grab the flags (if any)
      flags = trailing[0].slice(1);
      if (/e/.test(flags)) {
        escapeText = true;
        flags = flags.replace(/e/g, '');
      }
      // remove the trailing '/' & flags (if any)
      raw[raw.length - 1] = last.slice(0, -trailing[0].length);
      // remove the leading '/
      raw[0] = raw[0].slice(1);
    }
    return tagFn({ raw }, ...cookedValues);
  }

  // else return a tagged template function with the backwards-compatible
  // flags & options
  [ flags = '', options ] = args;
  if (typeof(flags) === 'object' && options === undefined) {
    options = flags;
    flags = '';
  }
  ({ escapeText = true } = options || {});

  return tagFn;

  function tagFn({ raw: literals }, ...cookedValues) {
    let out = ``;
    for (const i of literals.keys()) {
      let literal = literals[i];
      // replace white-space and comments in the raw string, allowing escaped '/'
      // and whitespace but also match the escaped escape /\\\\/, so it doesn't
      // act like an escape!
      out += literal.replace(/(\\\\|\\\/|\\\s)|\s+(?:\/\/.*)?/g, '$1');

      let cooked = cookedValues[i];
      if (cooked) {
        if (cooked.source) {
          // if the cooked substitution is a regex, then include its source
          cooked = cooked.source;
        } else if (escapeText) {
          // escape the substitution as a string when the substitution is not a
          // regex, and we are escaping text
          cooked = String(cooked).replace(
            /[-[\]/{}()*+?.\\^$|]/g,
            "\\$&"
          );
        }
        out += cooked;
      }
    }

    return new RegExp(out, flags);
  }

}

module.exports = blockRE;
