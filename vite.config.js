import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	// Enable SPA mode so our /index.html with <r4-app> works across refreshes.
	appType: 'spa',
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es'],
			fileName: 'r4',
			name: 'r4',
		},
		rollupOptions: {
			/* out input file to bundle the js & css */
			input: {
				main: resolve(__dirname, 'index.html'),
			},
		}
	},
})
