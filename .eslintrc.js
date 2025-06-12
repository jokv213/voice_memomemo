module.exports = {
  root: true,
  extends: [
    'airbnb',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  plugins: ['react', 'react-hooks', 'react-native', '@typescript-eslint', 'import', 'jsx-a11y'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'babel.config.js', 
    'e2e/**/*',
    'supabase/**/*',
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
  ],
  env: {
    'react-native/react-native': true,
    jest: true,
    es6: true,
    node: true,
  },
  rules: {
    // React Native specific
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    'react-native/no-raw-text': 'off',
    
    // React rules
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'react/prop-types': 'off',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-use-before-define': ['error', { variables: false }],
    
    // Import rules
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{ts,tsx,js,jsx}',
          '**/*.spec.{ts,tsx,js,jsx}',
          '**/setupTests.ts',
          '**/jest.config.js',
          '**/detox.config.js',
          'e2e/**/*',
        ],
      },
    ],
    
    // Accessibility rules (adapted for React Native)
    'jsx-a11y/accessible-emoji': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/aria-role': 'off',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-undef': 'off', // TypeScript handles this
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};