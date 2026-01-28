import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: resolve('src/index.js'),
			name: 'r4',
			fileName: 'r4',
			formats: ['es'],
		},
		rollupOptions: {
			output: {
				manualChunks: {
					ol: ['ol'],
					supabase: ['@supabase/supabase-js'],
					r4playerv1: ['radio4000-player']
				},
				dir: 'dist',
			},
		},
	},
})
