/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
    },
    {
      // Test files legitimately use `any` for mock typing flexibility
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'migrations/',
    '*.js',
    '!.eslintrc.js',
  ],
}
