import {resolve} from 'path'
import {defineConfig} from 'vite'
import recursive from 'recursive-readdir'

const BASE_URL = process.env.VITE_BASE || '/'

/* treat the path '/examples/r4-app.html/' as SPA (serve the file, let js handle route) */
const vitePluginR4AppSPA = (options) => ({
	name: 'vite-plugin-r4-app-spa',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			/* make a tmp URL */
			const {pathname} = new URL('https://localhost' + req.originalUrl)
			if (pathname.startsWith('/examples/r4-app/')) {
				req.url = '/examples/r4-app/'
			}
			next()
		})
	},
})

const generateExampleInputFiles = async () => {
	const entriesDir = resolve('./examples/')
	const entries = await recursive(entriesDir)
	const inputFiles = entries
		.filter((entry) => entry.endsWith('.html'))
		.reduce((acc, entry) => {
			const inputFilePath = entry.replace(__dirname + '/', '')
			const inputName = inputFilePath.replace('.html', '').split('/').join('_')
			acc[inputName] = inputFilePath
			return acc
		}, {})
	return inputFiles
}

const examples = await generateExampleInputFiles()

export default defineConfig({
	plugins: [vitePluginR4AppSPA()],
	base: BASE_URL,
	build: {
		rollupOptions: {
			input: {
				main: resolve('index.html'),
				docs: resolve('docs.html'),
				...examples,
			},
			output: {
				dir: 'dist-website',
			},
		},
	},
})
