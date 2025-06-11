module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['react', 'react-hooks', 'react-native', '@typescript-eslint', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    jest: true,
    es6: true,
    node: true,
  },
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [1, {extensions: ['.tsx']}],
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-unused-vars': 'off',
    'no-undef': 'off', // TypeScript handles this
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
