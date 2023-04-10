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
		this.count = 0
	}

	async connectedCallback() {
		super.connectedCallback()

		this.singleChannel = this.getAttribute('single-channel')
		this.selectedSlug = this.getAttribute('channel')

		supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_OUT') this.removeDatabaseListeners()

			if (event === "PASSWORD_RECOVERY") {
				const newPassword = prompt("What would you like your new password to be?");
				if (!newPassword) return
				const { data, error } = await supabase.auth.updateUser({ password: newPassword })
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
		if (this.userChannels) {
			const userChannelIds = this.userChannels.map(c => c.id)
			const userChannelsChanges = supabase.channel('user-channels-changes')
			userChannelsChanges.on('postgres_changes', {
				event: '*',
				schema: 'public',
				table: 'channels',
				filter: `id=in.(${userChannelIds.join(',')})`,
			}, (payload) => {
					this.refreshUserData()
			}).subscribe()
		}

		const userChannelEvents = supabase.channel('user-channels-events')
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
		return supabase.removeAllChannels()
	}

	render() {
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
		if (this.config.singleChannel) {
			return html`
				<r4-router
					name="channel"
					.store=${this.store}
					.config=${this.config}
				>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/" page="channel"></r4-route>
					<r4-route path="/tracks" page="tracks"></r4-route>
					<r4-route path="/tracks/:track_id" page="track" query-params="slug,url"></r4-route>
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
					<r4-route path="/explore" page="explore"></r4-route>
					<r4-route path="/sign" page="sign"></r4-route>
					<r4-route path="/sign/:method" page="sign"></r4-route>
					<r4-route path="/add" page="add" query-params="slug,url"></r4-route>
					<r4-route path="/new" page="new"></r4-route>
					<r4-route path="/settings" page="settings"></r4-route>
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
							<a href=${href + '/sign/up'}>Sign up</a>
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
							<a href="/settings">Settings</a>
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
			this.selectedSlug = slug
			page(`/${this.selectedSlug}`)
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
