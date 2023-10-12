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
		link: {type: Boolean},
	}

	constructor() {
		super()
		this.link = true
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

	play(event) {
		event.preventDefault()
		this.dispatchEvent(
			new CustomEvent('r4-play', {
				bubbles: true,
				detail: {
					track: this.track,
				},
			})
		)
	}

	render() {
		if (!this.track) return this.renderNoTrack()
		const t = this.track
		const title = t.title || t.id
		return html`
			${this.playing ? '' : ''}
			<r4-track-body>
				<r4-track-title>${this.link ? html`<a href=${this.url}>${title}</a>` : html`${title}`} </r4-track-title>
				<r4-track-description>${t.description}</r4-track-description>
			</r4-track-body>
			${t.discogs_url &&
			html`<r4-track-discogs-url><a href="${t.discogs_url}">View on Discogs</a></r4-track-discogs-url>`}
			<r4-track-tags><menu>${t.tags?.map((tag) => this.renderTag(tag))}</menu></r4-track-tags>
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
		return html`<li><a href="${url}" label>${label}</a></li>`
	}

	renderMention(slug) {
		if (!slug) return null
		const url = `${this.href}/${slug}`
		return html`<li><a href="${url}" label>${slug}</a></li>`
	}

	renderNoTrack() {
		return html`Track not found`
	}

	async onUpdate(event) {
		if (!event.detail.error) {
			this.track = await this.readTrack() // to-rerender
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
		if (detail === 'play') this.play()
	}

	createRenderRoot() {
		return this
	}
}
