import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import { readChannelTracks } from '@radio4000/sdk'
import page from 'page/page.mjs'
import '../pages/index.js'

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
	}

	connectedCallback() {
		super.connectedCallback()
		this.singleChannel = this.getAttribute('single-channel')
		this.channel = this.getAttribute('channel')
		console.log('first updated', this)
	}

	render() {
		return html`
			<r4-layout
				@r4-play=${this.onPlay}
				@click=${this.onAnchorClick}
				>
				<header slot="header">${this.buildAppMenu()}</header>
				<main slot="main">
					${this.buildAppRouter()}
				</main>
				<aside slot="player">
					<r4-player ${ref(this.playerRef)}></r4-player>
				</aside>
			</r4-layout>
		`
	}

	buildAppRouter() {
		console.log('this.singleChannel', this.singleChannel)
		if (this.singleChannel) {
			return html`
				<r4-router href=${this.href} name="channel">
					<r4-route path="/sign/in" page="sign" method="in"></r4-route>
					<r4-route path="/sign/out" page="sign" method="out"></r4-route>
					<r4-route path="/" page="channel" slug=${this.channel} limit="5" pagination="false" single-channel="true"></r4-route>
					<r4-route path="/tracks" page="tracks" slug=${this.channel} limit="300" pagination="true" single-channel="true"></r4-route>
					<r4-route path="/tracks/:track_id" page="track" slug=${this.channel} single-channel="true"></r4-route>
					<r4-route path="/add" page="add" slug=${this.channel} single-channel="true"></r4-route>
				</r4-router>
			`
		} else {
			return html`
				<r4-router href=${this.href} name="application">
					<r4-route path="/" page="home"></r4-route>
					<r4-route path="/explore" page="explore"></r4-route>
					<r4-route path="/sign" page="sign"></r4-route>
					<r4-route path="/sign/up" page="sign" method="up"></r4-route>
					<r4-route path="/sign/in" page="sign" method="in"></r4-route>
					<r4-route path="/sign/out" page="sign" method="out"></r4-route>
					<r4-route path="/add" page="add"></r4-route>
					<r4-route path="/:slug" page="channel" limit="5" pagination="false"></r4-route>
					<r4-route path="/:slug/tracks" page="tracks" limit="300" pagination="true"></r4-route>
					<r4-route path="/:slug/tracks/:track_id" page="track"></r4-route>
				</r4-router>
			`
		}
	}

	/* build the app's dom elements */
	buildAppMenu() {
		if (this.singleChannel) {
			/* when on slug.4000.network */
			return html`
				<r4-menu direction="row" origin=${this.href}>
					<a href=${this.href}>
						${this.channel}
					</a>
					<a href=${this.href + '/add'}>
						add
					</a>
					<a href=${this.href + '/tracks'}>
						tracks
					</a>
					<r4-auth-status>
						<span slot="in">
							<a href=${this.href + '/sign/out'}>sign out</a>
						</span>
						<span slot="out">
							<a href=${this.href + '/sign/in'}>sign in</a>
						</span>
					</r4-auth-status>
				</r4-menu>
			`
		} else {
			/* when on radio4000.com */
			return html`
				<r4-menu direction="row" origin=${this.href}>
					<a href=${this.href}>
						<r4-title small="true"></r4-title>
					</a>
					<a href=${this.href + '/explore'}>Explore</a>
					<a href=${this.href + '/add'}>Add</a>
					<r4-auth-status>
						<span slot="in">
							<a href=${this.href + '/sign/out'}>sign out</a>
						</span>
						<span slot="out">
							<a href=${this.href + '/sign/in'}>sign in</a>
						</span>
					</r4-auth-status>
					<r4-auth-status>
						<span slot="out">
							<a href=${this.href + '/sign/up'}>sign up</a>
						</span>
						<span slot="in">
							<r4-user-channels-select @input=${this.onChannelSelect}/>
						</span>
					</r4-auth-status>
				</r4-menu>
			`
		}
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
		const {channel} = detail
		if (channel) {
			const { data } = await readChannelTracks(channel)
			if (data) {
				this.playerRef.value.setAttribute('tracks', JSON.stringify(data))
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
