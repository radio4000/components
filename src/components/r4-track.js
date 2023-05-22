import { sdk } from '@radio4000/sdk'
import { LitElement, html } from 'lit'

export default class R4Track extends LitElement {
	static properties = {
		origin: { type: String },
		id: { type: String },
		track: { type: Object },
	}

	/* if the attribute changed, re-render */
	async willUpdate(attrName) {
		if (['id'].indexOf(attrName) > -1) {
			this.track = await this.readTrack(this.id)
		}
	}

	/* set loading */
	async connectedCallback() {
		super.connectedCallback()
		/* if there is already a track json data, render that */
		if (!this.track && this.id) {
			this.track = await this.readTrack(this.id)
		}
	}

	async readTrack(id) {
		this.setAttribute('loading', true)
		let res = {}
		if (id) {
			try {
				res = await sdk.tracks.readTrack(id)
				if (res.error) throw res
			} catch (error) {
				console.log('Error reading track', error)
			}
		}
		this.removeAttribute('loading')

		if (res.data) {
			return res.data
		} else {
			return { title: 'No data for this track' }
		}
	}

	render() {
		return this.track ? this.renderTrack() : this.renderNoTrack()
	}

	renderTrack() {
		const t = this.track
		return html`
			<a href=${this.origin + t.id}><r4-track-title>${t.title || t.id}</r4-track-title></a>
			<r4-track-description>${t.description}</r4-track-description>
			${t.discogs_url &&
			html`<r4-track-discogs-url><a href="${t.discogs_url}">View on Discogs</a></r4-track-discogs-url>`}
			<r4-track-tags>${t.tags.map((tag) => html`<span>${tag}</span>`)}</r4-track-tags>
			<r4-track-mentions>${t.mentions}</r4-track-mentions>
		`
	}
	renderNoTrack() {
		return html`Track not found`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
