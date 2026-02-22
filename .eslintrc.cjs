/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es2020: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'public/',
    'scripts/',
    'migrations/',
    '*.js',
    '*.cjs',
  ],
  rules: {
    // Relax rules that would require extensive changes in existing codebase.
    // Can be tightened incrementally over time.
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unsafe-function-type': 'warn',
    'prefer-const': 'warn',
    'no-case-declarations': 'warn',
    'no-constant-condition': 'warn',
    'no-prototype-builtins': 'warn',
    '@typescript-eslint/no-require-imports': 'warn',
    'no-useless-escape': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    'no-empty': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
