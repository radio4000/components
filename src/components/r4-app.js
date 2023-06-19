import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import DatabaseListeners from '../libs/db-listeners'
import '../pages/'

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
	set store(val) {
		// do nothing
	}

	get config() {
		return {
			singleChannel: this.singleChannel,
			href: this.href,
			selectedSlug: this.selectedSlug,
		}
	}
	set config(val) {
		// do nothing
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
			this.userChannels = undefined
			this.followers = undefined
			this.following = undefined
		} else {
			// Refresh user channels
			this.userChannels = (await sdk.channels.readUserChannels()).data
			if (this.userChannels && !this.selectedSlug) {
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
		const routerData = {store: this.store, config: this.config}
		return this.singleChannel ? renderRouterSingleChannel(routerData) : renderRouterCMS(routerData)
	}

	renderMenu() {
		const user = this.user
		const href = this.config?.href
		return html`
			<header slot="menu">
				<menu>
					<a href=${href + '/'}><r4-title small></r4-title></a>
					<a href=${href + '/explore'}>Explore</a>
					${!user ? html`<a href=${href + '/sign/up'}>Create radio</a>` : ''}
					${!user ? html`<a href=${href + '/sign/in'}>My radio</a>` : ''}
					${this.userChannels?.length
						? html`<a href=${href + '/' + this.selectedSlug}>@${this.selectedChannel.slug}</a>`
						: ''}
					${this.userChannels?.length ? html`<a href=${href + '/settings'}>Settings</a>` : ''}
				</menu>
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

		if (!tracks && channel?.slug) {
			const {data: channelTracks} = await sdk.channels.readChannelTracks(channel.slug)
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
			el.setAttribute('track', lastTrack.id)
		} else {
			el.removeAttribute('track')
		}
	}

	onTrackChange(event) {
		console.log(event.detail)
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

function renderRouterSingleChannel({store, config}) {
	return html`
		<r4-router name="channel" .store=${store} .config=${config}>
			<r4-route path="/sign/:method" page="sign"></r4-route>
			<r4-route path="/" page="channel"></r4-route>
			<r4-route path="/player" page="channel-player"></r4-route>
			<r4-route path="/tracks" page="channel-tracks"></r4-route>
			<r4-route path="/tracks/:track_id" page="channel-track"></r4-route>
			<r4-route path="/followers" page="channel-followers"></r4-route>
			<r4-route path="/following" page="channel-followings"></r4-route>
			<r4-route path="/add" page="add"></r4-route>
			<r4-route path="/settings" page="settings"></r4-route>
		</r4-router>
	`
}

function renderRouterCMS({store, config}) {
	return html`
		<r4-router name="application" .store=${store} .config=${config}>
			<r4-route path="/" page="home"></r4-route>
			<r4-route path="/explore" page="explore"></r4-route>
			<r4-route path="/sign" page="sign"></r4-route>
			<r4-route path="/sign/:method" page="sign"></r4-route>
			<r4-route path="/add" page="add"></r4-route>
			<r4-route path="/new" page="new"></r4-route>
			<r4-route path="/settings" page="settings"></r4-route>
			<r4-route path="/map" page="map"></r4-route>
			<r4-route path="/search" page="search"></r4-route>
			<r4-route path="/playground/:color" page="playground"></r4-route>
			<r4-route path="/:slug" page="channel"></r4-route>
			<r4-route path="/:slug/feed" page="channel-feed"></r4-route>
			<r4-route path="/:slug/update" page="channel-update"></r4-route>
			<r4-route path="/:slug/player" page="channel-player"></r4-route>
			<r4-route path="/:slug/tracks" page="channel-tracks"></r4-route>
			<r4-route path="/:slug/tracks/:track_id" page="channel-track"></r4-route>
			<r4-route path="/:slug/followers" page="channel-followers"></r4-route>
			<r4-route path="/:slug/following" page="channel-followings"></r4-route>
		</r4-router>
	`
}
