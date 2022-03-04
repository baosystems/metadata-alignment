const { config } = require('@dhis2/cli-style')

module.exports = {
  extends: [config.eslintReact],
  rules: {
    'import/order': ['off'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
}
