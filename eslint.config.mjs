import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier: prettier,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      curly: 'warn',
      eqeqeq: 'warn',
      semi: 'warn',
      'no-throw-literal': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
];
