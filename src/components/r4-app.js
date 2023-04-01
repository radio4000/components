import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import {
	signOut,
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
		count: {type: Number},
		didLoad: {type: Boolean, state: true}
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
			console.log('	auth change', event, session?.user?.email)

			if (event === 'SIGNED_OUT') this.removeDatabaseListeners()

			this.refreshUserData()
		})
	}

	async refreshUserData() {
		if (this.refreshUserData.running) return
		console.log('refresh user data')
		this.refreshUserData.running = true
		const {data} = await supabase.auth.getSession()
		const {data: channels} = await readUserChannels()
		this.userChannels = channels?.length ? channels : undefined
		this.user = data?.session?.user
		this.didLoad = true
		this.refreshUserData.running = false
		if (this.user) this.setupDatabaseListeners()
	}

	// When this is run, `user` and `userChannels` can be undefined.
	async setupDatabaseListeners() {
		console.log('set up database listeners')

		if (this.userChannels) {
			const userChannelIds = this.userChannels.map(c => c.id)
			const userChannelsChanges = supabase.channel('user-channels-changes')
			userChannelsChanges.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'channels',
				filter: `id=in.(${userChannelIds.join(',')})`,
			}, (payload) => {
					console.log('	db: (user) channels', payload)
					this.refreshUserData()
			}).subscribe(async (status) => {
				console.log('	db: channel', status)
			})
		}

		const userChannelEvents = supabase.channel('user-channels-events')
		userChannelEvents.on('postgres_changes', {
			event: '*',
			schema: 'public',
			table: 'user_channel',
			filter: `user_id=eq.${this.user.id}`,
		}, async (payload) => {
			console.log('	db: user_channels', payload)
			if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
				await this.removeDatabaseListeners()
				await this.refreshUserData()
			}
		}).subscribe(async (status) => {
			console.log('	db: user_channel', status)
		})
	}

	async removeDatabaseListeners() {
		console.log('removing database listeners')
		return supabase.removeAllChannels()
	}

	render() {
		console.log('<r4-app>', this.store.user?.role, this.userChannels?.length)

		if (!this.didLoad) return null

		return html`
			<r4-layout
				@r4-play=${this.onPlay}
				@click=${this.onAnchorClick}
				>
				<header slot="header">
					<button hidden @click=${() => this.count = this.count + 1}>Increment ${this.store.count}</button>
					${this.renderAppMenu()}</header>
				<main slot="main">
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
				<r4-router .store=${this.store} href=${this.href} name="channel" .singleChannel=${this.singleChannel}>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/" page="channel"></r4-route>
					<r4-route path="/tracks" page="tracks"></r4-route>
					<r4-route path="/tracks/:track_id" page="track"></r4-route>
					<r4-route path="/add" page="add" slug=${this.channel}></r4-route>
				</r4-router>
			`
		} else {
			return html`
				<r4-router .store=${this.store} href=${this.href} name="application">
					<r4-route path="/" page="home"></r4-route>
					<r4-route path="/explore" page="explore"></r4-route>
					<r4-route path="/sign" page="sign"></r4-route>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/add" page="add"></r4-route>
					<r4-route path="/new" page="new"></r4-route>
					<r4-route path="/:slug" page="channel"></r4-route>
					<r4-route path="/:slug/tracks" page="tracks"></r4-route>
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
						<span slot="out">
							<a href=${href + '/sign/up'}>Sign up</a>
						</span>
						<span slot="in">
							${this.userChannels ?
								html`<r4-user-channels-select @input=${this.onChannelSelect} .channels=${userChannels} />` :
								html`<a href=${href + '/new'}>Create channel</a>`
							}
						</span>
					</r4-auth-status>
				</li>
				<li>
					<r4-auth-status ?auth=${user}>
						<span slot="in">
							<button @click=${signOut}>Sign out</button>
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
							<a href=${this.href + '/sign/out'}>sign out</a>
						</span>
						<span slot="out">
							<a href=${this.href + '/sign/in'}>sign in</a>
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
