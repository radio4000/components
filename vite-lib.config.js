import {resolve} from 'path'
import {defineConfig} from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	publicDir: 'assets',
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		lib: {
			entry: resolve('src/index.js'),
			name: 'r4',
			fileName: 'r4',
			formats: ['es'],
		},
		rollupOptions: {
			// input: {
			// 	// r4: resolve(__dirname, 'src/index.js'),
			// 	// what: resolve(__dirname, 'styles/index.css'),
			// },
			output: {
				dir: 'dist-lib',
			},
		},
	},
})
