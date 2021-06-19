module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:jest/recommended',
    'airbnb-base',
  ],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: [
    'jest',
  ],
  rules: {
    'lines-between-class-members': ['error', 'always', {
      exceptAfterSingleLine: true,
    }],

    /*
      The import plugin used by airbnb-base is not compatible
      with @babel/eslint-parser, so these rules need to be
      disabled.
    */
    'import/extensions': 'off',
    'import/order': 'off',
    'import/no-self-import': 'off',
    'import/no-unresolved': 'off',
    'import/no-useless-path-segments': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
