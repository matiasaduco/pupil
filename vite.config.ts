import { defineConfig } from 'vite'
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
		outDir: path.resolve(__dirname, 'dist/webview'),
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, 'src/webview/index.html')
		}
	},
	plugins: [react(), tailwindcss()]
})
