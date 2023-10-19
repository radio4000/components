import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import DatabaseListeners from '../libs/db-listeners'
import '../pages/'
import ROUTES_CMS from '../data/routes-cms.json'
import ROUTES_SINGLE from '../data/routes-single.json'

export default class R4App extends LitElement {
	playerRef = createRef()

	static properties = {
		// public
		singleChannel: {type: Boolean, reflect: true, attribute: 'single-channel'},
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
		playingTrack: {type: Object},

		theme: {type: String, reflect: true},
		colorScheme: {type: String, attribute: 'color-scheme', reflect: true},
		themeStyles: {type: String, state: true},

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
			selectedChannel: this.selectedChannel,
		}
	}

	get config() {
		const client = this.href.split('://')[1]
		return {
			href: this.href,
			client,
			singleChannel: this.singleChannel,
			selectedSlug: this.selectedSlug,
			playingChannel: this.playingChannel,
			playingTrack: this.playingTrack,
		}
	}

	get selectedChannel() {
		if (!this.userChannels || !this.selectedSlug || !this.user) return null
		return this.userChannels.find((c) => c.slug === this.selectedSlug)
	}

	async connectedCallback() {
		super.connectedCallback()

		this.listeners = new DatabaseListeners(this)
		this.listeners.addEventListener('auth', async (event) => {
			this.user = event.detail.user
			this.refreshUserData()
			this.refreshUserAccount()
			if (event.detail === 'PASSWORD_RECOVERY') {
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
		if (this.refreshUserData.running) return
		this.refreshUserData.running = true

		if (!this.user) {
			this.userChannels = []
			this.followers = []
			this.following = []
		} else {
			// Refresh user channels
			this.userChannels = (await sdk.channels.readUserChannels()).data
			if (this.userChannels?.length && !this.selectedSlug) {
				this.selectedSlug = this.userChannels[0].slug
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
		// From local storage
		// From database
		if (this.store.userAccount?.theme) {
			this.theme = this.store.userAccount.theme
			this.themeStyles = await this.fetchTheme(this.store.userAccount.theme)
		} else {
			this.theme = 'default'
			this.themeStyles = await this.fetchTheme(this.theme)
		}
		if (this.store.userAccount?.color_scheme) {
			this.colorScheme = this.store.userAccount.color_scheme
		} else {
			// From OS settings
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			this.colorScheme = prefersDark ? 'dark' : 'light'
		}
	}
	async fetchTheme(name) {
		const url = `/theme-${name}.css`
		const themeUrl = new URL(url, import.meta.url).href
		const themeData = await fetch(themeUrl).then((res) => {
			const text = res.text()
			if (res.status === 404) {
				return null
			} else {
				return text
			}
		})
		return themeData
	}

	render() {
		if (!this.didLoad) return html`<progress value=${0} max="100"></progress> `
		return html`
			<r4-layout @r4-play=${this.onPlay} ?is-playing=${this.isPlaying}>
				${!this.config.singleChannel ? this.renderMenu() : null}
				<main slot="main">${this.renderRouter()}</main>
				<r4-player
					slot="player"
					${ref(this.playerRef)}
					?is-playing=${this.isPlaying}
					@trackchanged=${this.onTrackChange}
				></r4-player>
				${this.themeStyles ? this.renderThemeStyles() : null}
			</r4-layout>
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
				<r4-app-menu ?auth=${this.store?.user} href=${this.config?.href} slug=${this.selectedSlug}></r4-app-menu>
			</header>
		`
	}
	renderThemeStyles() {
		return html`
			<aside>
				<style>
					${this.themeStyles}
				</style>
			</aside>
		`
	}

	onChannelSelect({detail}) {
		if (detail.channel) {
			const {slug} = detail.channel
			this.selectedSlug = slug
			page(`/${this.selectedSlug}`)
		}
	}

	async onPlay({detail}) {
		if (!detail) {
			return this.stop()
		}
		const {channel, tracks, track, search, query} = detail
		const el = this.playerRef.value
		this.isPlaying = true
		this.playingChannel = channel
		this.playingTrack = track

		const slug = channel?.slug || track.slug
		let channelTracks = tracks
		if (!tracks && slug) {
			const {data} = await sdk.channels.readChannelTracks(slug)
			channelTracks = data.reverse()
		}

		if (channelTracks) {
			el.tracks = channelTracks
		} else {
			el.tracks = []
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
			const imageUrl = channel.image
			el.setAttribute('image', imageUrl)
		} else {
			el.removeAttribute('image')
		}

		if (track?.id) {
			el.setAttribute('track', track.id)
		} else if (tracks) {
			const lastTrack = tracks[tracks.length - 1]
			if (lastTrack) {
				el.setAttribute('track', lastTrack.id)
			}
		} else {
			el.removeAttribute('track')
		}
	}

	onTrackChange(event) {
		/* console.info(event.detail) */
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

	createRenderRoot() {
		return this
	}
}
