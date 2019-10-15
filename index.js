
// makeTagProcessor is a helper function to roll your own tag processor function
// eg, if you wanted to URI-encode substitution values in a template string,
// you could do something like so:
// let enc = makeTagProcessor((index, literals, cookedValues) => literals[index] + encodeURIComponent(cookedValues[index] || ''));
// let xx = 'hi there';
// console.log(enc`<span>${xx}</span>`);
// <span>hi%20there</span>
// or, using the postProcessor option:
// let $enc = makeTagProcessor(
//     (index, literals, cookedValues) => literals[index] + encodeURIComponent(cookedValues[index] || ''),
//     (str) => Ember.$(str)
// );
// let xx = 'hi there';
// console.log($enc`<span>${xx}</span>`);
// [ <span>hi%20there</span> ]

function makeTagProcessor(tagFn, postProcessor) {
  return function(literals, ...cookedValues) {
    let out = ``;
    for (const index of literals.keys()) {
      out += tagFn(index, literals, cookedValues);
    }
    if (postProcessor) {
      return postProcessor(out);
    }
    return out;
  };
}

function escapeForRegex(str) {
  return str.toString().replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

function isNone(obj) {
  return obj === null || obj === undefined;
}

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
function blockRE(flags, options) {
  if (typeof(flags) === 'object' && isNone(options)) {
    options = flags;
    flags = '';
  }
  options = options || { escapeText: true };
  return makeTagProcessor(function(index, literals, cookedValues) {
    let cooked = cookedValues[index];
    // replace white-space and comments in the raw string, allowing escaped '/' and whitespace
    // but also match the escaped escape /\\\\/, so it doesn't act like an escape!
    let literal = literals.raw[index].replace(/(\\\\|\\\/|\\\s)|\s+(?:\/\/.*)?/g, '$1');
    if (index === cookedValues.length) {
      return literal;
    }
    // this bit differs from/improves on the coffeescript block regex (which just substitutes
    // everything as a string, including regexes) because the coffee compiler just twiddles syntax
    if (cooked.source) {
      // if the cooked substitution is a regex, then include its source; <= whoopie
      cooked = cooked.source;
    } else if (options.escapeText) {
      // else if the substitution is not a regex, and we are escaping text
      // then escape the substitution as a string
      cooked = escapeForRegex(cooked);
    }
    return `${literal}${cooked}`;
  },
  // postProcessor: after assembling the regex string, turn it into a RegExp
  function(reString) {
    return new RegExp(reString, flags || '');
  });
}

module.exports = blockRE;
