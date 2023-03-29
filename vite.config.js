import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	// appType: 'mpa',
  build: {
		// https://vitejs.dev/guide/build.html#library-mode
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
			fileName: 'r4'
    },
    rollupOptions: {
      // external: /^lit/,
    },
  },
})
