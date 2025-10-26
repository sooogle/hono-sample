import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // Import順序のルール
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc', // アルファベット順にソート
            caseInsensitive: true, // 大文字小文字を区別しない
          },
        },
      ],
      // Import後に空行を強制
      'import/newline-after-import': ['error', { count: 1 }],
      // 重複したimportを禁止
      'import/no-duplicates': 'error',
    },
  }
);
