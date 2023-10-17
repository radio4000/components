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
		userChannels: {type: Array || null, state: true},
		followers: {type: Array || null, state: true},
		following: {type: Array || null, state: true},
		didLoad: {type: Boolean, state: true},

		isPlaying: {type: Boolean, attribute: 'is-playing', reflects: true},
		playingChannel: {type: Object},
		playingTrack: {type: Object},

		/* state for global usage */
		store: {type: Object, state: true},
		config: {type: Object, state: true},
	}

	// This gets passed to all r4-pages.
	get store() {
		return {
			user: this.user,
			userChannels: this.userChannels,
			followers: this.followers,
			following: this.following,
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
			if (event.detail === 'PASSWORD_RECOVERY') this.passwordRecovery()
		})
		this.listeners.addEventListener('user-channels', (event) => {
			if (event.detail.eventType === 'INSERT' || event.detail.eventType === 'DELETE') {
				this.refreshUserData()
			}
		})
		this.listeners.addEventListener('followers', (event) => {
			if (event.detail.eventType === 'INSERT' || event.detail.eventType === 'DELETE') {
				this.refreshUserData()
			}
		})
	}

	async refreshUserData() {
		// Ensure it doesn't run multiple times in parallel.
		if (this.refreshUserData.running) return
		this.refreshUserData.running = true

		// Refresh user theme settings
		this.setTheme()

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
		let theme = localStorage.getItem('r4.theme')
		// From database
		if (!theme && this.user) {
			const {data: account} = await sdk.supabase.from('accounts').select('theme').eq('id', this.user.id).single()
			theme = account.theme
		}
		// From OS settings
		if (!theme) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			theme = prefersDark ? 'dark' : 'light'
		}
		this.setAttribute('color-scheme', theme)
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

	onChannelSelect({detail}) {
		if (detail.channel) {
			const {slug} = detail.channel
			this.selectedSlug = slug
			page(`/${this.selectedSlug}`)
		}
	}

	async onPlay(event) {
		const {detail} = event
		if (!detail) {
			return this.stop()
		}

		const {channel, track} = detail
		let {tracks} = detail
		const el = this.playerRef.value

		this.isPlaying = true
		this.playingChannel = channel
		this.playingTrack = track

		const slug = channel?.slug || track.slug
		if (!tracks && slug) {
			const {data: channelTracks} = await sdk.channels.readChannelTracks(slug)
			tracks = channelTracks.reverse()
		}

		if (tracks) {
			el.tracks = tracks
		} else {
			el.tracks = []
		}

		if (channel?.name) {
			el.setAttribute('name', channel.name)
		} else {
			el.removeAttribute('name')
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
		el.removeAttribute('tracks')
	}

	createRenderRoot() {
		return this
	}
}
