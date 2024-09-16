import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import pkg from '../../package.json'
import {sdk, HCAPTCHA_SITE_KEY} from '../libs/sdk.js'
import {UI_STATES} from '../libs/appearance.js'
import page from 'page/page.mjs'
import DatabaseListeners from '../libs/db-listeners'
import Cache from '../libs/cache.js'
import '../pages/'
import ROUTES_CMS from '../data/routes-cms.json'
import ROUTES_SINGLE from '../data/routes-single.json'
import {THEMES, prefersDark} from '../libs/appearance.js'
import {createImage} from './r4-avatar.js'


export default class R4App extends LitElement {
	playerRef = createRef()

	static properties = {
		// public
		singleChannel: {type: Boolean, reflect: true, attribute: 'single-channel'},
		cdn: {type: String, reflect: true},
		// the channel slug
		selectedSlug: {type: String, reflect: true, attribute: 'channel'},
		href: {
			reflect: true,
			converter: (value) => {
				let hrefAttr = value || window.location.href
				if (hrefAttr.endsWith('/')) {
					hrefAttr = hrefAttr.slice(0, hrefAttr.length - 1)
				}
				return hrefAttr
			},
		},

		/* state */
		user: {type: Object, state: true},
		userAccount: {type: Object, state: true},
		userChannels: {type: Array || null, state: true},
		followers: {type: Array || null, state: true},
		following: {type: Array || null, state: true},
		didLoad: {type: Boolean, state: true},

		isPlaying: {type: Boolean, attribute: 'is-playing', reflects: true},
		playingChannel: {type: Object},
		playingTracks: {type: Array},
		playingTrack: {type: Object},

		version: {type: String, reflect: true},
		theme: {type: String, reflect: true},
		colorScheme: {type: String, attribute: 'color-scheme', reflect: true},

		/* state for global usage */
		store: {type: Object, state: true},
		config: {type: Object, state: true},
	}

	// This gets passed to all r4-pages.
	get store() {
		return {
			user: this.user,
			userAccount: this.userAccount,
			userChannels: this.userChannels,
			followers: this.followers,
			following: this.following,
			cache: this.cache,
			selectedChannel: this.selectedChannel,
		}
	}

	get config() {
		const client = this.href?.split('://')[1]
		return {
			href: this.href,
			hrefV1: 'https://v1.radio4000.com',
			hrefMigrate: 'https://migrate.radio4000.com',
			hcaptchaSiteKey: HCAPTCHA_SITE_KEY,
			client,
			version: this.version,
			singleChannel: this.singleChannel,
			selectedSlug: this.selectedSlug,

			/* maybe move this into a new object? (not config, but "player" or "store");
				 currently passed to too many things */
			isPlaying: this.isPlaying,
			playingChannel: this.playingChannel,
			playingTracks: this.playingTracks,
			playingTrack: this.playingTrack,
		}
	}

	get selectedChannel() {
		if (!this.userChannels || !this.selectedSlug || !this.user) return null
		return this.userChannels.find((c) => c.slug === this.selectedSlug)
	}

	// Allows loading the CSS themes from different sources.
	get themeHref() {
		const file = `${this.theme}.css`
		if (this.cdn?.length > 4) {
			return `${this.cdn}/dist/themes/${file}`
		} else if (this.cdn) {
			return `https://cdn.jsdelivr.net/npm/@radio4000/components@${this.version || 'latest'}/dist/themes/${file}`
		} else {
			return `/themes/${file}`
		}
	}

	constructor() {
		super()
		// Set current version
		this.version = pkg.version
		// Set default theme.
		this.theme = THEMES[0]
    this.cache = new Cache()
	}

	async connectedCallback() {
		super.connectedCallback()

		this.listeners = new DatabaseListeners(this)
		this.listeners.addEventListener('auth', async ({detail}) => {
			const sameUser = (this.user && this.user.id) === (detail.user && detail.user.id)
			if (
				detail.eventType === 'INITIAL_SESSION' ||
				(detail.eventType === 'SIGNED_IN' && !sameUser) ||
				detail.eventType === 'SIGNED_OUT'
			) {
				this.user = detail.user
				this.refreshUserData()
				this.refreshUserAccount()
			} else {
				// same user, no need to update
			}

			if (detail === 'PASSWORD_RECOVERY') {
				this.passwordRecovery()
			}
		})
		this.listeners.addEventListener('user-channels', ({detail}) => {
			if (['INSERT', 'DELETE', 'UPDATE'].includes(detail.eventType)) {
				this.refreshUserData()
			}
		})
		this.listeners.addEventListener('followers', ({detail}) => {
			if (['INSERT', 'DELETE', 'UPDATE'].includes(detail.eventType)) {
				this.refreshUserData()
			}
		})
		this.listeners.addEventListener('user-account', ({detail}) => {
			if (['INSERT', 'DELETE', 'UPDATE'].includes(detail.eventType)) {
				this.refreshUserAccount(detail.new)
			}
		})
	}

	async refreshUserAccount(newAccount) {
		if (this.user && newAccount) {
			this.userAccount = newAccount
		}
		if (this.user && !this.store.userAccount) {
			const {data, error} = await sdk.supabase.from('accounts').select('*').eq('id', this.user.id).single()
			if (data) {
				this.userAccount = data
			} else if (error) {
				// create user account (should be in DB auto when creating account)
				this.userAccount = await sdk.supabase.from('accounts').insert({id: this.user.id}).single()
			}
		}
		this.setTheme()
	}

	async refreshUserData() {
		// Ensure it doesn't run multiple times in parallel.
		if (this.refreshUserData.running) {
			return
		}
		this.refreshUserData.running = true

		if (!this.user) {
			if (!this.singleChannel) this.selectedSlug = null
			this.userChannels = []
			this.followers = []
			this.following = []
		} else {
			// Handle case after deleting user
			const {error: userError} = await sdk.users.readUser()
			if (userError) {
				await sdk.auth.signOut()
			}

			// Refresh user channels
			this.userChannels = (await sdk.channels.readUserChannels()).data
			if (this.userChannels?.length && !this.selectedSlug) {
				this.selectedSlug = this.userChannels[0].slug
			}

			// On deleted channel
			if (!this.userChannels?.length && this.selectedSlug) {
				this.selectedSlug = null
			}

			// Set followers and following
			if (this.selectedChannel) {
				this.followers = (await sdk.channels.readFollowers(this.selectedChannel.id)).data
				this.following = (await sdk.channels.readFollowings(this.selectedChannel.id)).data
			}

			// In case the `this.user` changed, we must refresh the listeners.
			this.listeners.start()
		}

		this.didLoad = true
		this.refreshUserData.running = false
	}

	async passwordRecovery() {
		const newPassword = prompt('What would you like your new password to be?')
		if (!newPassword) return
		const {data, error} = await sdk.supabase.auth.updateUser({password: newPassword})
		if (data) alert('Password updated successfully!')
		if (error) alert('There was an error updating your password.')
	}

	async setTheme() {
		if (this.store.userAccount?.theme) {
			this.theme = this.store.userAccount.theme
		} else {
			this.theme = THEMES[0]
		}
		if (this.store.userAccount?.color_scheme) {
			this.colorScheme = this.store.userAccount.color_scheme
		} else {
			// From OS settings
			this.colorScheme = prefersDark ? 'dark' : 'light'
		}
	}

	onChannelSelect({detail: channel}) {
		if (channel) {
			if (this.selectedSlug === channel.slug) {
				/* page(`/${this.selectedSlug}`) */
			} else {
				this.selectedSlug = channel.slug
				this.refreshUserData()
			}
		}
	}

	async onPlay({detail}) {
		if (!detail) return this.stop()

		let {channel, tracks, search} = detail
		let {track} = detail
		const el = this.playerRef.value

		if (track?.id) {
			el.track = track
		} else if (tracks?.length) {
			el.track = tracks[0]
		}

		// If we know which channel it is, but don't have any tracks
		// Load and queue them in player
		const slug = channel?.slug || track.slug
		if (slug && !tracks?.length) {
			// Don't load and set tracks if we can avoid it.
			const sameName = el.playlist && el.playlist.title === channel?.name
			if (sameName && el.tracks?.length) {
				// if (!el.track) {
				// 	const randomTrack = el.tracks[Math.floor(Math.random() * el.tracks.length)]
				// 	el.track = randomTrack
				// }
			} else {
				const {data} = await sdk.channels.readChannelTracks(slug)
				tracks = data.reverse().map((track) => {
					track.body = track.description
					return track
				})
				el.tracks = tracks
				el.track = track || tracks.at(-1)
			}
		} else if (slug && tracks) {
			el.tracks = tracks
				.slice()
				.reverse()
				.map((track) => {
					track.body = track.description
					return track
				})
			el.track = tracks.at(0)
		}

		if (channel?.name) {
			el.setAttribute('name', channel.name)
		} else {
			el.removeAttribute('name')
		}

		if (search) {
			el.setAttribute('query', search)
		} else {
			el.removeAttribute('query')
		}

		if (channel?.image) {
			const imageUrl = createImage(channel.image)
			el.setAttribute('image', imageUrl)
		} else {
			el.removeAttribute('image')
		}

		// Update state about what's playing.
		this.isPlaying = true
		this.playingChannel = channel
		this.playingTrack = track
		this.playingTracks = tracks
	}

	onTrackChange(event) {
		this.playingTrack = event.detail[0].track
		// add to history?
	}

	stop() {
		/* stop the global playing state */
		this.isPlaying = false

		/* clean the `r4-player` component (so it hides) */
		const el = this.playerRef.value
		el.removeAttribute('track')
		el.removeAttribute('image')
		el.removeAttribute('name')
		el.removeAttribute('query')
		el.removeAttribute('tracks')
	}

	render() {
		if (!this.didLoad) {
			return html`<r4-layout><r4-loading slot="main"></r4-loading></r4-layout>`
		}
		return html`
			<r4-layout @r4-play=${this.onPlay} ?is-playing=${this.isPlaying}>
				${!this.config.singleChannel ? this.renderMenu() : null}
				<main slot="main">${this.renderRouter()}</main>
				<r4-player
					slot="player"
					platform="true"
					.isPlaying=${this.config.isPlaying}
					@trackchange=${this.onTrackChange}
					${ref(this.playerRef)}
				></r4-player>
				<form slot="playback-controls">${Object.entries(UI_STATES).map(this.renderPlayerUICtrl.bind(this))}</form>
			</r4-layout>
			<r4-command-menu modal .config=${this.config} .store=${this.store}></r4-command-menu>
			<link rel="stylesheet" href=${this.themeHref} />
		`
	}

	/* the default routers:
		 - one for the channel in CMS mode (all channels are accessible)
		 - one for when only one channel should be displayed in the UI
	 */
	renderRouter() {
		if (this.singleChannel) {
			return html`
				<r4-router name="channel" .store=${this.store} .config=${this.config} .routes=${ROUTES_SINGLE}></r4-router>
			`
		} else {
			return html`
				<r4-router name="application" .store=${this.store} .config=${this.config} .routes=${ROUTES_CMS}> </r4-router>
			`
		}
	}

	renderMenu() {
		return html`
			<header slot="menu">
				<r4-app-menu ?auth=${this.store?.user} href=${this.config?.href}></r4-app-menu>
				<r4-app-user-menu
					href=${this.config?.href}
					.channel=${this.store.selectedChannel}
					.channels=${this.store.userChannels}
					@select=${this.onChannelSelect}
				></r4-app-user-menu>
			</header>
		`
	}

	renderPlayerUICtrl(uiState) {
		const [value, name] = uiState
		return html`
			<button value=${value} title=${name} name=${name} type="submit">
				<r4-icon name="player_${name}"></r4-icon>
			</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
