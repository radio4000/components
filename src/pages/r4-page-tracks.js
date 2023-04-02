import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readChannel } from '@radio4000/sdk'

export default class R4PageTracks extends LitElement {
	static properties = {
		store: { type: Object, state: true },
		params: { type: Object, state: true },
		config: { type: Object, state: true },

		channel: { type: Object, reflect: true, state: true },
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/{{slug}}`
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/{{id}}'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/{{id}}'
		}
	}

	async firstUpdated() {
		await this.init()
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const { data } = await readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	init() {
		// a promise for the `until` directive
		this.channel = this.findSelectedChannel(this.params.slug)
	}

	render() {
		return html`${
			until(
				Promise.resolve(this.channel).then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				}).catch(() => this.renderNoPage()),
				this.renderLoading()
			)
		}`
	}

	renderPage(channel) {
		return html`
			<header>
				<r4-channel
					.channel=${channel}
					origin=${this.channelOrigin}
					slug=${channel.slug}
					></r4-channel>
			</header>
			<main>
				<r4-tracks
					channel=${channel.slug}
					origin=${this.tracksOrigin}
					limit="10"
					pagination="true"
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
}
