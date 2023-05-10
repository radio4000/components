import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/'

// https://github.com/visionmedia/page.js/issues/537
/* page.configure({ window: window }) */

export default class R4App extends LitElement {
	playerRef = createRef()

	static properties = {
		/* public attributes, config props */
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel', state: true },
		selectedSlug: { type: String, reflect: true, attribute: 'channel', state: true }, // channel slug
		href: {
			reflect: true,
			converter: (value) => {
				let hrefAttr = value || window.location.href
				if (hrefAttr.endsWith('/')) {
					hrefAttr = hrefAttr.slice(0, hrefAttr.length - 1)
				}
				return hrefAttr
			}
		},

		/* state */
		user: {type: Object, state: true},
		userChannels: {type: Array || null, state: true},
		didLoad: {type: Boolean, state: true},
		isPlaying: {type: Boolean, attribute: 'is-playing', reflects: true},
	}

	// This gets passed to all r4-pages.
	get store() {
		return {
			user: this.user,
			userChannels: this.userChannels,
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

	constructor() {
		super()
	}

	async connectedCallback() {
		super.connectedCallback()

		this.singleChannel = this.getAttribute('single-channel')
		this.selectedSlug = this.getAttribute('channel')

		sdk.supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT') this.removeDatabaseListeners()

			// @todo redirect to a /set-password page or similar instead of the prompt
			if (event === "PASSWORD_RECOVERY") {
				const newPassword = prompt("What would you like your new password to be?");
				if (!newPassword) return
				const { data, error } = await sdk.supabase.auth.updateUser({ password: newPassword })
				if (data) alert("Password updated successfully!")
				if (error) alert("There was an error updating your password.")
			}

			await this.refreshUserData()
			if (this.store.userChannels) {
				if (!this.config.selectedSlug) {
					this.selectedSlug = this.store.userChannels[0].slug
				}
			}
		})
	}

	async refreshUserData() {
		if (this.refreshUserData.running) return
		this.refreshUserData.running = true

		const {data} = await sdk.supabase.auth.getSession()
		this.user = data?.session?.user

		if (this.user) {
			const {data: channels} = await sdk.channels.readUserChannels()
			this.userChannels = channels?.length ? channels : undefined
			this.setupDatabaseListeners()
		} else {
			this.userChannels = undefined
		}

		this.didLoad = true
		this.refreshUserData.running = false
	}

	// When this is run, `user` and `userChannels` can be undefined.
	async setupDatabaseListeners() {
		if (this.userChannels) {
			const userChannelIds = this.userChannels.map(c => c.id)
			const userChannelsChanges = sdk.supabase.channel('user-channels-changes')
			userChannelsChanges.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'channels',
				filter: `id=in.(${userChannelIds.join(',')})`,
			}, (payload) => {
					this.refreshUserData()
			}).subscribe()
		}

		const userChannelEvents = sdk.supabase.channel('user-channels-events')
		userChannelEvents.on('postgres_changes', {
			event: '*',
			schema: 'public',
			table: 'user_channel',
			filter: `user_id=eq.${this.user.id}`,
		}, async (payload) => {
			if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
				await this.removeDatabaseListeners()
				await this.refreshUserData()
			}
		}).subscribe()
	}

	async removeDatabaseListeners() {
		console.log('removing database listeners')
		return sdk.supabase.removeAllChannels()
	}

	render() {
		if (!this.didLoad) return null

		return html`
			<r4-layout
				@r4-play=${this.onPlay}
				?is-playing=${this.isPlaying}
				>
				<header slot="menu">
					${this.renderAppMenu()}
				</header>
				<main slot="main">
					${this.renderAppRouter()}
				</main>
				<r4-player
					slot="player"
					${ref(this.playerRef)}
					?is-playing=${this.isPlaying}
					></r4-player>
			</r4-layout>
		`
	}

	renderAppRouter() {
		if (this.config.singleChannel) {
			return html`
				<r4-router
					name="channel"
					.store=${this.store}
					.config=${this.config}
					>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/" page="channel"></r4-route>
					<r4-route path="/player" page="channel-player"></r4-route>
					<r4-route path="/tracks" page="channel-tracks" query-params="page,limit"></r4-route>
					<r4-route path="/tracks/:track_id" page="channel-track" query-params="slug,url"></r4-route>
					<r4-route path="/add" page="add" query-params="url"></r4-route>
					<r4-route path="/settings" page="settings"></r4-route>
				</r4-router>
			`
		} else {
			return html`
				<r4-router
					name="application"
					.store=${this.store}
					.config=${this.config}
					>
					<r4-route path="/" page="home"></r4-route>
					<r4-route path="/explore" page="explore" query-params="page,limit"></r4-route>
					<r4-route path="/sign" page="sign"></r4-route>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/add" page="add" query-params="slug,url"></r4-route>
					<r4-route path="/new" page="new"></r4-route>
					<r4-route path="/settings" page="settings"></r4-route>
					<r4-route path="/map" page="map" query-params="slug,longitude,latitude"></r4-route>
					<r4-route path="/:slug" page="channel"></r4-route>
					<r4-route path="/:slug/update" page="channel-update"></r4-route>
					<r4-route path="/:slug/player" page="channel-player"></r4-route>
					<r4-route path="/:slug/tracks" page="channel-tracks" query-params="page,limit"></r4-route>
					<r4-route path="/:slug/tracks/:track_id" page="channel-track"></r4-route>
				</r4-router>
			`
		}
	}

	/* build the app's dom elements */
	renderAppMenu() {
		/* when on slug.4000.network */
		if (this.config.singleChannel) {
			return this.buildSingleChannelMenu()
		} else {
			/* when on radio4000.com */
			return this.renderMenuCMS()
		}
	}

	renderMenuCMS() {
		const {userChannels, href, user} = this

		return html`
			<menu>
				<li>
					<a href=${href}>
						<r4-title small></r4-title>
					</a>
				</li>
				<li>
					<a href=${href + '/explore'}>Explore</a>
				</li>
				${this.userChannels ? html`<li><a href=${href + '/add'}>Add</a></li>` : null}
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="out">
							<a href=${href + '/sign/up'}>Create account</a>
						</span>
						<span slot="in">
							${
								!this.userChannels ?
									html`<a href=${href + '/new'}>Create channel</a>` :
									this.userChannels.length === 1 ?
										html`<a href=${`${href}/${this.userChannels[0].slug}`}>${this.userChannels[0].name}</a>` :
										html`<r4-user-channels-select @input=${this.onChannelSelect} .channels=${userChannels} />`
							}
						</span>
					</r4-auth-status>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="in">
							<a href=${`${this.config.href}/settings`}>Settings</a>
						</span>
					</r4-auth-status>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="in">
							<button @click=${sdk.auth.signOut}>Sign out</button>
						</span>
						<span slot="out">
							<a href=${href + '/sign/in'}>Sign in</a>
						</span>
					</r4-auth-status>
				</li>
			</menu>
		`
	}

	buildSingleChannelMenu() {
		return html`
			<menu>
				<li>
					<a href=${this.config.href}>
						${this.selectedSlug}
					</a>
				</li>
				<li>
					<a href=${this.config.href + '/add'}>
						add
					</a>
				</li>
				<li>
					<a href=${this.config.href + '/tracks'}>
						tracks
					</a>
				</li>
				<li>
					<r4-auth-status>
						<span slot="in">
							<a href=${this.config.href + '/sign/out'}>sign out</a>
						</span>
						<span slot="out">
							<a href=${this.config.href + '/sign/in'}>sign in</a>
						</span>
					</r4-auth-status>
				</li>
			</menu>
		`
	}

	/* events */
	onChannelSelect({ detail }) {
		if (detail.channel) {
			const { slug } = detail.channel
			this.selectedSlug = slug
			page(`/${this.selectedSlug}`)
		}
	}

	/* play some data */
	async onPlay(event) {
		const {detail} = event
		if (!detail) {
			return this.stop()
		}

		const {channel, track} = detail

		if (channel && channel.slug) {
			this.isPlaying = true
			const { data: channelTracks } = await sdk.channels.readChannelTracks(channel.slug)
			const tracks = channelTracks.reverse()

			if (tracks) {
				this.playerRef.value.setAttribute(
					'tracks',
					JSON.stringify(tracks)
				)
			} else {
				this.playerRef.value.removeAttribute('tracks')
			}

			if (channel.name) {
				this.playerRef.value.setAttribute('name', channel.name)
			} else {
				this.playerRef.value.removeAttribute('name')
			}

			if (channel.image) {
				const imageUrl = channel.image
				this.playerRef.value.setAttribute('image', imageUrl)
			} else {
				this.playerRef.value.removeAttribute('image')
			}

			if (track && track.id) {
				this.playerRef.value.setAttribute('track', track.id)
			} else if (tracks) {
				const lastTrack = tracks[tracks.length - 1]
				this.playerRef.value.setAttribute('track', lastTrack.id)
			} else {
				this.playerRef.value.removeAttribute('track')
			}
		}
	}

	stop() {
		/* stop the global playing state */
		this.isPlaying = false
		console.log('stop: this.isPlaying', this.isPlaying)
1
		/* clean the `r4-player` component (so it hides) */
		this.playerRef.value.removeAttribute('track')
		this.playerRef.value.removeAttribute('image')
		this.playerRef.value.removeAttribute('name')
		this.playerRef.value.removeAttribute('tracks')
	}

		/* no shadow dom */
		createRenderRoot() {
		return this
	}
}
