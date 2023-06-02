import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/'

export default class R4App extends LitElement {
	playerRef = createRef()

	static properties = {
		/* public attributes, config props */
		singleChannel: {type: Boolean, reflect: true, attribute: 'single-channel', state: true},
		selectedSlug: {type: String, reflect: true, attribute: 'channel', state: true}, // channel slug
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
		followings: {type: Array || null, state: true},
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
			followings: this.followings,
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
		if (!this.config.selectedSlug || !this.user || !this.userChannels) return null
		return this.userChannels.find((c) => c.slug === this.selectedSlug)
	}

	async connectedCallback() {
		super.connectedCallback()

		// is the app running in "single visible channel" mode?
		this.singleChannel = this.getAttribute('single-channel')

		// which channel is currently selected in UI (or forced as single visible one)
		this.selectedSlug = this.getAttribute('channel')

		sdk.supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT') this.removeDatabaseListeners()

			// @todo redirect to a /set-password page or similar instead of the prompt
			if (event === 'PASSWORD_RECOVERY') {
				const newPassword = prompt('What would you like your new password to be?')
				if (!newPassword) return
				const {data, error} = await sdk.supabase.auth.updateUser({password: newPassword})
				if (data) alert('Password updated successfully!')
				if (error) alert('There was an error updating your password.')
			}

			await this.refreshUserData()
		})
	}

	async refreshUserData() {
		if (this.refreshUserData.running) return
		this.refreshUserData.running = true

		const {data} = await sdk.supabase.auth.getSession()
		this.user = data?.session?.user

		if (this.user) {
			// this.setTheme()

			// load user channels
			const {data: channels} = await sdk.channels.readUserChannels()
			this.userChannels = channels?.length ? channels : undefined

			// load current channel followers/followings
			if (!this.config.selectedSlug && this.userChannels) {
				this.selectedSlug = this.userChannels[0].slug
			}

			if (this.selectedChannel) {
				const {data: followers} = await sdk.channels.readFollowers(this.selectedChannel.id)
				const {data: followings} = await sdk.channels.readFollowings(this.selectedChannel.id)
				this.followers = followers
				this.followings = followings
			}

			/* finally set the db listeners for changes in "user data";
				 it needs to have access to all user state, and selectedChannel
			 */
			this.setupDatabaseListeners()
		} else {
			this.userChannels = undefined
			this.followers = undefined
			this.followings = undefined
		}

		this.didLoad = true
		this.refreshUserData.running = false
	}

	async setTheme() {
		// Load account settings and set prefered theme.
		const {data: account} = await sdk.supabase.from('accounts').select('theme').eq('id', this.user.id).single()
		if (account?.theme) {
			localStorage.setItem('r4.theme', account.theme)
			this.setAttribute('color-scheme', account.theme)
		}
	}

	// When this is run, `user` and `userChannels` can be undefined.
	async setupDatabaseListeners() {
		// always cleanup existing listeners
		await this.removeDatabaseListeners()

		if (this.userChannels) {
			const userChannelIds = this.userChannels.map((c) => c.id)
			const userChannelsChanges = sdk.supabase.channel('user-channels-changes')
			userChannelsChanges
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'channels',
						filter: `id=in.(${userChannelIds.join(',')})`,
					},
					(payload) => {
						this.refreshUserData()
					}
				)
				.subscribe()
		}

		const userChannelEvents = sdk.supabase.channel('user-channels-events')
		userChannelEvents
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'user_channel',
					filter: `user_id=eq.${this.user.id}`,
				},
				async (payload) => {
					if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
						/* need to remove listeners, because the userChannels changed
					 (so to listen to changes in the new ones) */
						await this.refreshUserData()
					}
				}
			)
			.subscribe()

		if (this.selectedChannel?.id) {
			const userFavoriteEvents = sdk.supabase.channel('user-channel-favorites')
			userFavoriteEvents
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'followers',
						filter: `follower_id=eq.${this.selectedChannel.id}`,
					},
					async (payload) => {
						if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
							await this.refreshUserData()
						}
					}
				)
				.subscribe()
		}
	}

	async removeDatabaseListeners() {
		return sdk.supabase.removeAllChannels()
	}

	render() {
		if (!this.didLoad) return html`<progress value=${0} max="100"></progress> `

		return html`
			<r4-layout @r4-play=${this.onPlay} ?is-playing=${this.isPlaying}>
				${!this.config.singleChannel ? this.renderAppMenu() : null}
				<main slot="main">${this.renderAppRouter()}</main>
				<r4-player slot="player" ${ref(this.playerRef)} ?is-playing=${this.isPlaying}></r4-player>
			</r4-layout>
		`
	}

	/* the default routers:
	 - one for the channel in CMS mode (all channels are accessible)
	 - one for when only one channel should be displayed in the UI
 */
	renderAppRouter() {
		const routerData = {store: this.store, config: this.config}
		return this.singleChannel ? renderRouterSingleChannel(routerData) : renderRouterCMS(routerData)
	}

	renderAppMenu() {
		return html`
			<header slot="menu">
				<a href=${this.config.href}><r4-title small></r4-title></a>
			</header>
		`
	}

	/* events */
	onChannelSelect({detail}) {
		if (detail.channel) {
			const {slug} = detail.channel
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
		let {tracks} = detail

		if (channel?.slug) {
			this.isPlaying = true

			if (!tracks) {
				const {data: channelTracks} = await sdk.channels.readChannelTracks(channel.slug)
				tracks = channelTracks.reverse()
			}

			if (tracks) {
				this.playerRef.value.tracks = tracks
			} else {
				this.playerRef.value.tracks = []
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

function renderRouterSingleChannel({store, config}) {
	return html`
		<r4-router name="channel" .store=${store} .config=${config}>
			<r4-route path="/sign/:method" page="sign"></r4-route>
			<r4-route path="/" page="channel"></r4-route>
			<r4-route path="/player" page="channel-player"></r4-route>
			<r4-route path="/tracks" page="channel-tracks" search-params="page,limit,order-by,order-config,filters"></r4-route>
			<r4-route path="/tracks/:track_id" page="channel-track" search-params="slug,url"></r4-route>
			<r4-route path="/followers" page="channel-followers" search-params="page,limit"></r4-route>
			<r4-route path="/followings" page="channel-followings" search-params="page,limit"></r4-route>
			<r4-route path="/add" page="add" search-params="url"></r4-route>
			<r4-route path="/settings" page="settings"></r4-route>
		</r4-router>
	`
}

function renderRouterCMS({store, config}) {
	return html`
		<r4-router name="application" .store=${store} .config=${config}>
			<r4-route path="/" page="home"></r4-route>
			<r4-route path="/explore" page="explore" search-params="page,limit"></r4-route>
			<r4-route path="/sign" page="sign"></r4-route>
			<r4-route path="/sign/:method" page="sign"></r4-route>
			<r4-route path="/add" page="add" search-params="slug,url"></r4-route>
			<r4-route path="/new" page="new"></r4-route>
			<r4-route path="/settings" page="settings"></r4-route>
			<r4-route path="/map" page="map" search-params="slug,longitude,latitude"></r4-route>
			<r4-route path="/search" page="search" search-params="query"></r4-route>
			<r4-route path="/:slug" page="channel"></r4-route>
			<r4-route path="/:slug/update" page="channel-update"></r4-route>
			<r4-route path="/:slug/player" page="channel-player"></r4-route>
			<r4-route
				path="/:slug/tracks"
				page="channel-tracks"
				search-params="page,limit,order-by,order-config,filters"
			></r4-route>
			<r4-route path="/:slug/tracks/:track_id" page="channel-track"></r4-route>
			<r4-route path="/:slug/followers" page="channel-followers" search-params="page,limit"></r4-route>
			<r4-route path="/:slug/followings" page="channel-followings" search-params="page,limit"></r4-route>
		</r4-router>
	`
}
