import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

export default class R4Track extends LitElement {
	static properties = {
		origin: {type: String},
		href: {type: String},
		id: {type: String},
		track: {type: Object},
		channel: {type: Object},
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
			if (this.id) {
				this.track = await this.readTrack()
			}
		}
	}

	get playing() {
		const x = this.config?.playingTrack?.id === this.track.id
		this.toggleAttribute('playing', x)
		return x
	}

	set playing(value) {
		// console.info('set playing', value)
	}

	get url() {
		return this.origin + this.track.id
	}

	get trackId() {
		return this.id || this.track?.id
	}

	async connectedCallback() {
		super.connectedCallback()
		/* load by id if no track */
		if (!this.track && this.id) {
			this.track = await this.readTrack()
		}
	}

	async readTrack() {
		this.loading = true
		try {
			const res = await sdk.tracks.readTrack(this.trackId)
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
		if (!this.track || !this.channel) {
			return this.renderNoTrack()
		}

		return html`
			<r4-button-play .channel=${this.channel} .track=${this.track}></r4-button-play>
			<r4-track-title>${this.renderTitle()}</r4-track-title>
			${this.track.description ? this.renderDescription() : null}
			${this.track.discogs_url ? this.renderDiscogsUrl() : null} ${this.track?.tags?.length ? this.renderTags() : null}
			${this.track?.mentions?.length ? this.renderMentions() : null} ${this.renderMenu()}

			<r4-dialog name="update">
				<r4-track-update
					slot="dialog"
					id=${this.track.id}
					url=${this.track.url}
					title=${this.track.title}
					discogsUrl=${this.track.discogsUrl}
					description=${this.track.description}
					@submit=${this.onUpdate}
				></r4-track-update>
			</r4-dialog>
			<r4-dialog name="delete">
				<r4-track-delete slot="dialog" id=${this.track.id} @submit=${this.onDelete}></r4-track-delete>
			</r4-dialog>
			<r4-dialog name="share">
				<r4-share slot="dialog" origin=${this.origin} track-id=${this.track.id}></r4-share>
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
	renderMenu() {
		if (this.canEdit) {
			return html`
				<menu>
					<li>
						<button @click=${() => this.openDialog('share')}>Share</button>
					</li>
					<li>
						<button @click=${() => this.openDialog('update')}>Update</button>
					</li>
					<li>
						<button @click=${() => this.openDialog('delete')}>Delete</button>
					</li>
				</menu>
			`
		} else {
			return html`
				<menu>
					<li>
						<button @click=${() => this.openDialog('share')}>Share</button>
					</li>
				</menu>
			`
		}
	}
	renderNoTrack() {
		return html`Track not found`
	}
	async onUpdate(event) {
		if (!event.detail.error) {
			if (this.trackId) {
				this.track = await this.readTrack()
			}
			this.closeDialog('update')
		}
	}
	async onDelete(event) {
		if (!event.detail.error) {
			this.id = null
			this.track = null
			this.remove()
			this.closeDialog('delete')
		}
	}
	openDialog(name) {
		this.querySelector(`r4-dialog[name="${name}"]`).open()
	}
	closeDialog(name) {
		this.querySelector(`r4-dialog[name="${name}"]`).close()
	}
	createRenderRoot() {
		return this
	}
}
