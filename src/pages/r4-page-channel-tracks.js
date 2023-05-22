import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { sdk } from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		store: { type: Object, state: true },
		params: { type: Object, state: true },
		query: { type: Object, state: true },
		config: { type: Object, state: true },

		channel: { type: Object, reflect: true, state: true },
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/'
		}
	}

	async firstUpdated() {
		await this.init()
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const { data } = await sdk.channels.readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	init() {
		// a promise for the `until` directive
		if (this.config.singleChannel) {
			this.channel = this.findSelectedChannel(this.config.selectedSlug)
		} else {
			this.channel = this.findSelectedChannel(this.params.slug)
		}
	}

	render() {
		return html`${until(
			Promise.resolve(this.channel)
				.then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				})
				.catch(() => this.renderNoPage()),
			this.renderLoading()
		)}`
	}

	renderPage(channel) {
		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${channel.slug}</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks'}>tracks</a>
				</nav-item>
			</nav>
			<main>
				<br />
				<r4-track-search slug=${channel.slug} href=${this.channelOrigin}></r4-track-search>
				<r4-tracks
					channel=${channel.slug}
					origin=${this.tracksOrigin}
					limit=${this.query.limit || 15}
					page=${this.query.page || 1}
					pagination="true"
					@r4-list=${this.onNavigateList}
				></r4-tracks>
			</main>
		`
	}
	renderNoPage() {
		return html`404 - No channel with this slug`
	}
	renderLoading() {
		return html`<span>Loading channel tracks...</span>`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}

	onNavigateList({ detail }) {
		/* `page` here, is usually globaly the "router", beware */
		const { page: currentPage, limit, list } = detail
		const newPageURL = new URL(window.location)

		limit && newPageURL.searchParams.set('limit', limit)
		currentPage && newPageURL.searchParams.set('page', currentPage)

		if (window.location.href !== newPageURL.href) {
			page(newPageURL.pathname + newPageURL.search)
		}
	}
}
