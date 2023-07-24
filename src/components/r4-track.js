import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'
import page from 'page/page.mjs'

export default class R4Track extends LitElement {
	static properties = {
		origin: {type: String},
		href: {type: String},
		id: {type: String},
		track: {type: Object},
		config: {type: Object}, // from r4-app
		loading: {type: Boolean, reflect: true, state: true},
		playing: {type: Boolean, reflect: true},
		canEdit: {type: Boolean}
	}

	/* if the attribute changed, re-render */
	async willUpdate(changedProperties) {
		if (changedProperties.has('id')) {
			this.track = await this.readTrack(this.id)
		}
	}

	get playing() {
		const x = this.config?.playingTrack?.id === this.track.id
		this.toggleAttribute('playing', x)
		return x
	}

	set playing(value) {
		// console.log('set playing', value)
	}

	get url() {
		return this.origin + this.track.id
	}

	async connectedCallback() {
		super.connectedCallback()
		if (!this.track && this.id) {
			this.track = await this.readTrack(this.id)
		}
	}

	async readTrack(id) {
		this.loading = true
		let res = {}
		if (id) {
			try {
				res = await sdk.tracks.readTrack(id)
				if (res.error) throw res
			} catch (error) {
				console.log('Error reading track', error)
			}
		}
		this.loading = false

		if (res.data) {
			return res.data
		} else {
			return {title: 'No data for this track'}
		}
	}

	render() {
		return this.track ? this.renderTrack() : this.renderNoTrack()
	}

	renderTrack() {
		const t = this.track
		return html`
			${this.playing ? '' : ''}
			<a href=${this.url}><r4-track-title>${t.title || t.id}</r4-track-title></a>
			<r4-track-description>${t.description}</r4-track-description>
			${t.discogs_url &&
			html`<r4-track-discogs-url><a href="${t.discogs_url}">View on Discogs</a></r4-track-discogs-url>`}
			<r4-track-tags>${t.tags.map((tag) => this.renderTag(tag))}</r4-track-tags>
			<r4-track-mentions>${t.mentions.map((m) => this.renderMention(m))}</r4-track-mentions>
			${this.canEdit
				? html`<r4-track-actions id=${t.id} .canEdit=${this.canEdit} @input=${this.onAction}></r4-track-actions>`
				: ''}
		`
	}

	renderNoTrack() {
		return html`Track not found`
	}

	renderTag(label) {
		if (!label) return null
		const filter = JSON.stringify({column: 'tags', operator: 'contains', value: label})
		const url = `${this.origin}?filters=[${filter}]`
		return html`<a href="${url}" label>${label}</a>`
	}

	renderMention(slug) {
		if (!slug) return null
		const url = `${this.href}/${slug}`
		return html`<a href="${url}" label>${slug}</a>`
	}

	onAction({detail}) {
		if (detail === 'update') page(`/${this.track.slug}/tracks/${this.track.id}/update`)
		if (detail === 'delete') page(`/${this.track.slug}/tracks/${this.track.id}/delete`)
		if (detail === 'play') {
			console.log(this.track.slug)
			const playEvent = new CustomEvent('r4-play', {
				bubbles: true,
				detail: {
					// channel: // we don't have it here
					track: this.track,
				},
			})
			this.dispatchEvent(playEvent)
		}
		// if (['share'].indexOf(detail) > -1) {
		// 	this.openDialog(detail)
		// }
	}

	createRenderRoot() {
		return this
	}
}
