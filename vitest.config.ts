/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	root: path.resolve(__dirname, 'src/webview'),
	resolve: {
		alias: {
			'@webview': path.resolve(__dirname, 'src/webview'),
			'@components': path.resolve(__dirname, 'src/webview/components')
		}
	},
	plugins: [react(), tailwindcss()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: [path.resolve(__dirname, 'src/webview/test/setup.ts')],
		include: ['**/*.{test,spec}.{ts,tsx}'],
		alias: {
			'@webview': path.resolve(__dirname, 'src/webview'),
			'@components': path.resolve(__dirname, 'src/webview/components')
		}
	}
})
