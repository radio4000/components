import {LitElement, html} from 'lit'

export default class R4ShareTrack extends LitElement {
	static get properties() {
		return {
			origin: {type: String},
			track: {type: Object},
			href: {type: String},
		}
	}

	constructor() {
		super()
		this.track = {}
	}

	get trackOriginUrl() {
		return `${this.origin}/${this.track.id}`
	}
	get shareToR4Url() {
		return `${this.href}/add?url=${this.track.url}&discogs_url=${this.track?.discogs_url}`
	}

	render() {
		return html`
			<form>
				<fieldset>
					<label for="track_url">Track URL</label>
					<input
						readonly
						name="track_url"
						type="url"
						.value="${this.track.id ? this.trackOriginUrl : this.track.url}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
				<fieldset>
					<label for="media_url">Media URL</label>
					<input readonly name="media_url" type="url" .value="${this.track.url}" @click="${this.onInputClick}" />
				</fieldset>
				<fieldset>
					<a name="r4_add" href="${this.shareToR4Url}">Add to <r4-title></r4-title> channel</a>
				</fieldset>
			</form>
		`
	}

	onInputClick(event) {
		event.target.select()
	}
}
