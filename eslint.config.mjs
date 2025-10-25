import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

export default [
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		plugins: {
			'@typescript-eslint': typescriptEslint,
			prettier: prettier
		},
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2022,
			sourceType: 'module'
		},
		ignores: ['src/global.d.ts'],
		rules: {
			...typescriptEslint.configs.recommended.rules,
			'prettier/prettier': [
				'error',
				{ endOfLine: 'auto', semi: false, trailingComma: 'none', useTabs: true }
			],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			curly: 'warn',
			eqeqeq: 'warn',
			semi: ['error', 'never'],
			'comma-dangle': ['error', 'never'],
			'no-throw-literal': 'warn',
			'prefer-const': 'warn'
		}
	}
]
