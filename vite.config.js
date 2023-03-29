import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	// Enable SPA mode so our /index.html with <r4-app> works across refreshes.
	appType: 'spa',
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
