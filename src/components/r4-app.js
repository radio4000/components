import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import {
	readChannelTracks,
	readUserChannels,
	readUser,
	supabase,
} from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/'

// https://github.com/visionmedia/page.js/issues/537
/* page.configure({ window: window }) */

export default class R4App extends LitElement {
	playerRef = createRef()

	static properties = {
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel', state: true },
		channel: { type: String, reflect: true},
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

		user: {type: Object, state: true},
		userChannels: {type: Array || null, state: true},
		count: {type: Number}
	}

	// This gets passed to all r4-pages.
	get store() {
		return {
			user: this.user,
			userChannels: this.userChannels,
			count: this.count
		}
	}

	set store(val) {
		// do nothing
	}

	constructor() {
		super()
		this.count = 0
	}

	async connectedCallback() {
		super.connectedCallback()

		this.singleChannel = this.getAttribute('single-channel')
		this.channel = this.getAttribute('channel')

		supabase.auth.onAuthStateChange((event, session) => {
			console.debug('auth state change', event, session)
			this.user = session?.user
			// if (!this.user) this.userChannels = null
			this.refreshUserData()
		})

		await this.refreshUserData()

		if (this.user) {
			this.setupDatabaseListeners()
		}
	}

	async refreshUserData() {
		console.debug('refreshUserData')

		readUserChannels().then(({data}) => {
			this.userChannels = data.length ? data : null
			this.didLoad = true
		})

		// await readUser()
		supabase.auth.getSession().then(({data}) => {
			this.user = data.session?.user
		})
	}

	setupDatabaseListeners() {
		// one channel for user channels updates
		const userChannelsChanges = supabase.channel('user-channels-changes')

		let userChannelIds = []
		if (this.userChannels) {
			userChannelIds = this.userChannels.map(channel => channel.id)
		}
		console.debug('user-id', this.user.id)

		userChannelsChanges.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'channels',
				filter: `id=in.(${userChannelIds.join(',')})`,
			},
			(payload) => {
				console.debug('user channel(s) update', payload)
				this.refreshUserData()
			}
		).subscribe(async (status) => {
			console.debug('channel subscribe event', status)
		})

		const userChannelEvents = supabase.channel('user-channels-events')
		userChannelEvents.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'user_channel',
				filter: `user_id=eq.${this.user.id}`,
			},
			(payload) => console.debug('user_channels change *', payload)
		).subscribe(async (status) => {
			console.debug('user_channels subscribe event', status)
		})
	}

	render() {
		console.log('r4-app', this.store)

		if (!this.didLoad) return null

		return html`
			<r4-layout
				@r4-play=${this.onPlay}
				@click=${this.onAnchorClick}
				>
				<header slot="header">
					<button @click=${() => this.count = this.count + 1}>Increment ${this.store.count}</button>
					${this.renderAppMenu()}</header>
				<main slot="main">
					<p>test: ${this.user?.email}/${this.store.user?.email}</p>
					${this.renderAppRouter()}
				</main>
				<aside slot="player">
					<r4-player ${ref(this.playerRef)}></r4-player>
				</aside>
			</r4-layout>
		`
	}

	renderAppRouter() {
		if (this.singleChannel) {
			return html`
				<r4-router .store=${this.store} href=${this.href} name="channel">
					<r4-route path="/sign-in" page="sign" method="in"></r4-route>
					<r4-route path="/sign-out" page="sign" method="out"></r4-route>
					<r4-route path="/" page="channel" slug=${this.channel} limit="5" pagination="false" single-channel="true"></r4-route>
					<r4-route path="/tracks" page="tracks" slug=${this.channel} limit="300" pagination="true" single-channel="true"></r4-route>
					<r4-route path="/tracks/:track_id" page="track" slug=${this.channel} single-channel="true"></r4-route>
					<r4-route path="/add" page="add" slug=${this.channel} single-channel="true" query-params="url"></r4-route>
				</r4-router>
			`
		} else {
			return html`
				<r4-router .store=${this.store} href=${this.href} name="application">
					<r4-route path="/" page="home"></r4-route>
					<r4-route path="/explore" page="explore"></r4-route>
					<r4-route path="/sign" page="sign"></r4-route>
					<r4-route path="/sign-up" page="sign" method="up"></r4-route>
					<r4-route path="/sign-in" page="sign" method="in"></r4-route>
					<r4-route path="/sign-out" page="sign" method="out"></r4-route>
					<r4-route path="/add" page="add" query-params="url,channel"></r4-route>
					<r4-route path="/new" page="new"></r4-route>
					<r4-route path="/:slug" page="channel" limit="5" pagination="false"></r4-route>
					<r4-route path="/:slug/tracks" page="tracks" limit="300" pagination="true"></r4-route>
					<r4-route path="/:slug/tracks/:track_id" page="track"></r4-route>
				</r4-router>
			`
		}
	}

	/* build the app's dom elements */
	renderAppMenu() {
		/* when on slug.4000.network */
		if (this.singleChannel) {
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
						<span slot="in">
							<a href=${href + '/sign-out'}>Sign out</a> (${user?.email})
						</span>
						<span slot="out">
							<a href=${href + '/sign-in'}>Sign in</a>
						</span>
					</r4-auth-status>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="out">
							<a href=${href + '/sign-up'}>Sign up</a>
						</span>
						<span slot="in">
							${this.userChannels ?
								html`<r4-user-channels-select @input=${this.onChannelSelect} .channels=${userChannels} />` :
								html`<a href=${href + '/new'}>Create channel</a>`
							}
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
					<a href=${this.href}>
						${this.channel}
					</a>
				</li>
				<li>
					<a href=${this.href + '/add'}>
						add
					</a>
				</li>
				<li>
					<a href=${this.href + '/tracks'}>
						tracks
					</a>
				</li>
				<li>
					<r4-auth-status>
						<span slot="in">
							<a href=${this.href + '/sign-out'}>sign out</a>
						</span>
						<span slot="out">
							<a href=${this.href + '/sign-in'}>sign in</a>
						</span>
					</r4-auth-status>
				</li>
			</menu>
		`
	}

	/* fix page.js not handle anchors correctly? */
	onAnchorClick(event) {
		const wrappingAnchor = event.target.closest('a')
		if (wrappingAnchor && wrappingAnchor.tagName === 'A') {
			event.preventDefault()
			page(wrappingAnchor.pathname)
		}
	}

	/* events */
	onChannelSelect({ detail }) {
		if (detail.channel) {
			const { slug } = detail.channel
			this.channel = slug
			page(`/${slug}`)
		}
	}

	/* play some data */
	async onPlay({detail}) {
		const {channel, track} = detail
		if (channel) {
			const { data } = await readChannelTracks(channel)
			if (data) {
				this.playerRef.value.setAttribute('tracks', JSON.stringify(data))
				this.playerRef.value.setAttribute('track', track)
			} else {
				this.playerRef.value.removeAttribute('tracks')
			}
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
