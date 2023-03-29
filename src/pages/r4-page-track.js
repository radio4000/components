import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readTrack } from '@radio4000/sdk'

export default class R4PageTrack extends LitElement {
	static properties = {
		slug: { type: String, reflect: true },
		trackId: { type: String, reflect: true, attribute: 'track-id' },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },
		track: { type: Object, reflect: true, state: true },
	}

	async firstUpdated() {
		this.track = await this.findTrack()
		this.requestUpdate()
	}

	/* find data, the current channel id we want to add to */
	async findTrack() {
		const { data } = await readTrack(this.trackId)
		if (data && data.id) {
			return data
		}
	}

	/* render */
	render() {
		return html`${until(this.track ? this.renderPage() : this.renderNoPage(), this.renderLoading())}`
	}
	renderPage() {
		console.log('page this.track', this.track)
		return html`
			<main>
				<r4-track
					.track=${this.track}
					id=${this.trackId}
					></r4-track>
			</main>
		`
	}
	renderNoPage() {
		return html`404 - No track with this id`
	}
	renderLoading() {
		return html`<span>Loading track...</span>`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
