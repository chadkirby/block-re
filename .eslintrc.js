module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018
  },
  env: {
    'es6': true
  },
  extends: [
    'plugin:turbopatent/node'
  ],
  rules: {
    "no-shadow": [
      "error", 
      { builtinGlobals: true, hoist: "functions", allow: [ "URL" ] }
    ]
  },
  overrides: []
};