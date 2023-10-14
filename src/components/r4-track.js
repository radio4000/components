import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'
import page from 'page/page.mjs'

export default class R4Track extends LitElement {
	static properties = {
		origin: {type: String},
		href: {type: String},
		id: {type: String},
		track: {type: Object},
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
			const res = await sdk.tracks.readTrack(this.id)
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
		if (!this.track) {
			return this.renderNoTrack()
		}

		return html`
			<r4-button-play
				.channel=${this.channel}
				.track=${this.track}></r4-button-play>
			<r4-track-title>${this.renderTitle()}</r4-track-title>
			${this.track.description ? this.renderDescription() : null}
			${this.track.discogs_url ? this.renderDiscogsUrl() : null}
			${this.track?.tags?.length ? this.renderTags() : null}
			${this.track?.mentions?.length ? this.renderMentions() : null}
			${this.renderActions()}

			<r4-dialog>
				span slot="dialog">
				<r4-track-update
					id=${this.track.id}
					url=${this.track.url}
					title=${this.track.title}
					discogsUrl=${this.track.discogsUrl}
					description=${this.track.description}
					@submit=${this.onUpdate}
					></r4-track-update>
				</span>
			</r4-dialog>
		`
	}

	renderTitle() {
		const title = this.track.title || this.track.id
		return this.link ? html`<a href=${this.url}>${title}</a>` : title
	}
	renderDescription() {
		return html`<r4-track-description>${this.track.description}</r4-track-description>`
	}
	renderDiscogsUrl() {
		return html`<r4-track-discogs-url>(<a href="${this.track.discogs_url}">Discogs</a>)</r4-track-discogs-url>`
	}
	renderTags() {
		return html`<r4-track-tags><menu>${this.track.tags?.map((tag) => this.renderTag(tag))}</menu></r4-track-tags>`
	}
	renderTag(label) {
		if (!label) return null
		const filter = JSON.stringify({column: 'tags', operator: 'contains', value: label})
		const url = `${this.origin}?filters=[${filter}]`
		return html`<li><a href="${url}" label>${label}</a></li>`
	}
	renderMentions() {
		return html` <r4-track-mentions>
			<menu> ${this.track.mentions?.map((m) => this.renderMention(m))} </menu>
		</r4-track-mentions>`
	}
	renderMention(slug) {
		if (!slug) return null
		const url = `${this.href}/${slug}`
		return html`<li><a href="${url}" label>${slug}</a></li>`
	}
	renderActions() {
		return html`<r4-track-actions
			track-id=${this.track.id}
			.canEdit=${this.canEdit}
			@input=${this.onAction}
		></r4-track-actions>`
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
		if (detail === 'update') {
			this.querySelector('r4-dialog').open()
			page(`/${this.track.slug}/tracks/${this.track.id}/update`)
		}
		if (detail === 'delete') page(`/${this.track.slug}/tracks/${this.track.id}/delete`)
		if (detail === 'play') this.play()
	}

	createRenderRoot() {
		return this
	}
}
