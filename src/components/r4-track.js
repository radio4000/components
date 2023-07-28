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
		canEdit: {type: Boolean},
	}

	/* if the attribute changed, re-render */
	async willUpdate(changedProperties) {
		if (changedProperties.has('id')) {
			this.track = await this.readTrack()
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
			this.track = await this.readTrack()
		}
	}

	async readTrack() {
		this.loading = true
		try {
			const res = await sdk.tracks.readTrack(this.track.id)
			if (res.error) throw res
			return res.data
		} catch (error) {
			console.error('Error reading track', error)
		} finally {
			this.loading = false
		}
	}

	render() {
		if (!this.track) return this.renderNoTrack()
		const t = this.track
		return html`
			${this.playing ? '' : ''}
			<r4-track-body>
				<r4-track-title><a href=${this.url}> ${t.title || t.id}</a></r4-track-title>
				<r4-track-description>${t.description}</r4-track-description>
			</r4-track-body>
			${t.discogs_url &&
			html`<r4-track-discogs-url><a href="${t.discogs_url}">View on Discogs</a></r4-track-discogs-url>`}
			<r4-track-tags>${t.tags?.map((tag) => this.renderTag(tag))}</r4-track-tags>
			<r4-track-mentions>${t.mentions?.map((m) => this.renderMention(m))}</r4-track-mentions>
			${this.canEdit
				? html`<r4-track-actions id=${t.id} .canEdit=${this.canEdit} @input=${this.onAction}></r4-track-actions>`
				: ''}

			<r4-dialog>
				<span slot="dialog">
					<r4-track-update
						id=${t.id}
						url=${t.url}
						title=${t.title}
						discogsUrl=${t.discogsUrl}
						description=${t.description}
						@submit=${this.onUpdate}
					></r4-track-update>
				</span>
			</r4-dialog>
		`
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

	async onUpdate(event) {
		console.log('onUpdate', event.detail)
		if (!event.detail.error) {
			this.track = await this.readTrack()
			this.querySelector('r4-dialog').close()
		}
	}

	onAction({detail}) {
		console.log(detail)
		if (detail === 'update') {
			this.querySelector('r4-dialog').open()
			// page(`/${this.track.slug}/tracks/${this.track.id}/update`)
		}
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
	}

	createRenderRoot() {
		return this
	}
}
