import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageTracks extends LitElement {
	static properties = {
		slug: { type: String, reflect: true },
		href: { type: String, reflect: true },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },
	}

	get tracksOrigin() {
		if (this.singleChannel) {
			return this.href + '/tracks/{{id}}'
		} else {
			return this.href + '/' + this.slug + '/tracks/{{id}}'
		}
	}

	/* render */
	render() {
		return html`${until(this.slug ? this.renderPage() : this.renderNoPage(), this.renderLoading())}`
	}

	renderPage() {
		console.log('page this.channel', this.channel)
		return html`
			<main>
				<r4-tracks
					channel=${this.slug}
					origin=${this.tracksOrigin}
					limit="10"
					pagination="true"
					></r4-tracks>
			</main>
		`
	}
	renderNoPage() {
		return html`404 - No Tracks for this channel slug`
	}
	renderLoading() {
		return html`<span>Loading channel tracks...</span>`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
