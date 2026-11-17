const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/** Builds a `no-restricted-imports` rule that explains which layer the import would break. */
const forbid = (group, message) => ({ 'no-restricted-imports': ['error', { patterns: [{ group, message }] }] });

module.exports = defineConfig([
  expoConfig,
  { ignores: ['dist/**', '.expo/**'] },

  // The layering described in README.md, enforced: dependencies only point downwards.
  // A later entry replaces an earlier one for the same file, so the most specific layer comes last.
  {
    files: ['src/components/**', 'src/hooks/**', 'src/i18n/**'],
    rules: forbid(['@/features/**', '@/app/**'], 'Shared code must not depend on a feature or a screen.'),
  },
  {
    files: ['src/features/**'],
    rules: forbid(['@/app/**'], 'Features must not depend on screens; a screen composes features, not the other way round.'),
  },
  {
    files: ['src/features/*/domain/**'],
    rules: forbid(
      ['react', 'react-*', 'expo', 'expo-*', '@/components/**', '@/hooks/**', '@/app/**', '@/theme'],
      'Domain code is plain TypeScript: no React, React Native, Expo or UI imports. That is what keeps it testable in Node.',
    ),
  },
]);
