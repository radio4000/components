import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	appType: 'mpa',
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
})
