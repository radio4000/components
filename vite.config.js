import { resolve } from 'path'
import { defineConfig } from 'vite'

/* treat the path '/examples/r4-app.html/' as SPA (serve the file, let js handle URL route) */
const vitePluginR4AppSPA = (options) => ({
	name: 'vite-plugin-r4-app-spa',
	configureServer(server) {
		server.middlewares.use((req, res, next) => {
			if (req.originalUrl.startsWith('/examples/r4-app.html/')) {
				req.url = '/examples/r4-app.html'
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
	// Enable SPA mode so our /index.html with <r4-app> works across refreshes.
	/* appType: 'spa', */
	build: {
		// https://vitejs.dev/guide/build.html#library-mode
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			formats: ['es'],
			fileName: 'r4',
			name: 'r4',
		},
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),

				r4Actions: resolve(__dirname, 'examples/r4-actions.html'),
				r4App: resolve(__dirname, 'examples/r4-app.html'),
				r4AuthStatus: resolve(__dirname, 'examples/r4-auth-status.html'),
				r4Channel: resolve(__dirname, 'examples/r4-channel.html'),
				r4ChannelActions: resolve(__dirname, 'examples/r4-channel-actions.html'),
				r4ChannelCreate: resolve(__dirname, 'examples/r4-channel-create.html'),
				r4ChannelDelete: resolve(__dirname, 'examples/r4-channel-delete.html'),
				r4ChannelSharer: resolve(__dirname, 'examples/r4-channel-sharer.html'),
				r4ChannelUpdate: resolve(__dirname, 'examples/r4-channel-update.html'),
				r4Channels: resolve(__dirname, 'examples/r4-channels.html'),
				r4Dialog: resolve(__dirname, 'examples/r4-dialog.html'),
				r4Favicon: resolve(__dirname, 'examples/r4-favicon.html'),
				r4Layout: resolve(__dirname, 'examples/r4-layout.html'),
				r4List: resolve(__dirname, 'examples/r4-list.html'),
				r4Player: resolve(__dirname, 'examples/r4-player.html'),
				r4ResetPassword: resolve(__dirname, 'examples/r4-reset-password.html'),
				r4Router: resolve(__dirname, 'examples/r4-router.html'),
				r4SignIn: resolve(__dirname, 'examples/r4-sign-in.html'),
				r4SignOut: resolve(__dirname, 'examples/r4-sign-out.html'),
				r4SignUp: resolve(__dirname, 'examples/r4-sign-up.html'),
				r4Title: resolve(__dirname, 'examples/r4-title.html'),
				r4Track: resolve(__dirname, 'examples/r4-track.html'),
				r4TrackActions: resolve(__dirname, 'examples/r4-track-actions.html'),
				r4TrackCreate: resolve(__dirname, 'examples/r4-track-create.html'),
				r4TrackDelete: resolve(__dirname, 'examples/r4-track-delete.html'),
				r4TrackUpdate: resolve(__dirname, 'examples/r4-track-update.html'),
				r4Tracks: resolve(__dirname, 'examples/r4-tracks.html'),
				r4User: resolve(__dirname, 'examples/r4-user.html'),
				r4UserChannelsSelect: resolve(__dirname, 'examples/r4-user-channels-select.html'),
			},
		}
	},
})
