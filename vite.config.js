import { resolve } from 'path'
import { defineConfig } from 'vite'

/* treat the path '/examples/r4-app.html/' as SPA (serve the file, let js handle URL route) */
const vitePluginR4AppSPA = (options) => ({
	name: 'vite-plugin-r4-app-spa',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			if (req.originalUrl.startsWith('/examples/r4-app')) {
				req.url = '/examples/r4-app/'
			}
			next()
		})
	}
})

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vitePluginR4AppSPA(),
	],
	base: './',
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				examples: resolve(__dirname, 'examples/index.html'),

				r4Actions: resolve(__dirname, 'examples/r4-actions/index.html'),
				r4App: resolve(__dirname, 'examples/r4-app/index.html'),
				r4App404: resolve(__dirname, 'examples/r4-app/404.html'), // a 404 page for the app SPA, redirects to the index
				r4AuthStatus: resolve(__dirname, 'examples/r4-auth-status/index.html'),
				r4Channel: resolve(__dirname, 'examples/r4-channel/index.html'),
				r4ChannelActions: resolve(__dirname, 'examples/r4-channel-actions/index.html'),
				r4ChannelCreate: resolve(__dirname, 'examples/r4-channel-create/index.html'),
				r4ChannelDelete: resolve(__dirname, 'examples/r4-channel-delete/index.html'),
				r4ChannelSharer: resolve(__dirname, 'examples/r4-channel-sharer/index.html'),
				r4ChannelUpdate: resolve(__dirname, 'examples/r4-channel-update/index.html'),
				r4Channels: resolve(__dirname, 'examples/r4-channels/index.html'),
				r4Dialog: resolve(__dirname, 'examples/r4-dialog/index.html'),
				r4Favicon: resolve(__dirname, 'examples/r4-favicon/index.html'),
				r4Layout: resolve(__dirname, 'examples/r4-layout/index.html'),
				r4List: resolve(__dirname, 'examples/r4-list/index.html'),
				r4Player: resolve(__dirname, 'examples/r4-player/index.html'),
				r4ResetPassword: resolve(__dirname, 'examples/r4-reset-password/index.html'),
				r4Router: resolve(__dirname, 'examples/r4-router/index.html'),
				r4SignIn: resolve(__dirname, 'examples/r4-sign-in/index.html'),
				r4SignOut: resolve(__dirname, 'examples/r4-sign-out/index.html'),
				r4SignUp: resolve(__dirname, 'examples/r4-sign-up/index.html'),
				r4Title: resolve(__dirname, 'examples/r4-title/index.html'),
				r4Track: resolve(__dirname, 'examples/r4-track/index.html'),
				r4TrackActions: resolve(__dirname, 'examples/r4-track-actions/index.html'),
				r4TrackCreate: resolve(__dirname, 'examples/r4-track-create/index.html'),
				r4TrackDelete: resolve(__dirname, 'examples/r4-track-delete/index.html'),
				r4TrackUpdate: resolve(__dirname, 'examples/r4-track-update/index.html'),
				r4Tracks: resolve(__dirname, 'examples/r4-tracks/index.html'),
				r4User: resolve(__dirname, 'examples/r4-user/index.html'),
				r4UserChannelsSelect: resolve(__dirname, 'examples/r4-user-channels-select/index.html'),
			},
		}
	},
})
