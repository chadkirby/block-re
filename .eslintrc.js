module.exports = {
  parserOptions: {
    ecmaVersion: 2020
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ["dist"],
  overrides: [
    // typescript
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'prefer-const': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    }

  ]
};
