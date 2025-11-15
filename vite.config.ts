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
	build: {
		chunkSizeWarningLimit: 4600,
		outDir: path.resolve(__dirname, 'dist/webview'),
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, 'src/webview/index.html')
		}
	},
	plugins: [react(), tailwindcss()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/webview/test/setup.ts'],
		include: ['src/webview/**/*.{test,spec}.{ts,tsx}']
	}
})
