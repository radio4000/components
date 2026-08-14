import { LitElement, html } from 'lit';

/**
 * Form with shareable URLs for a track
 */
export default class R4ShareTrack extends LitElement {
	static get properties() {
		return {
			origin: { type: String },
			track: { type: Object },
			href: { type: String },
			canNavigatorShare: { type: Boolean }
		};
	}

	onInputClick(event) {
		event.target.select();
	}

	constructor() {
		super();
		this.track = {};
		this.canNavigatorShare = !!navigator?.share;
	}

	get trackOriginUrl() {
		return `${this.origin}${this.track.id}`;
	}

	get shareToR4Url() {
		return `${this.href}/add?track_id=${this.track.id}`;
	}

	shareService() {
		if (this.canNavigatorShare) {
			navigator.share({
				url: this.trackOriginUrl
			})
				.catch(console.error);
		}
	}

	shareMedia() {
		if (this.canNavigatorShare) {
			navigator.share({
				url: this.track.url
			})
				.catch(console.error);
		}
	}

	shareDiscogs() {
		if (this.canNavigatorShare) {
			navigator.share({
				url: this.track.discogs_url
			})
				.catch(console.error);
		}
	}

	buildServiceUrlDom() {
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareService}">
						Share <r4-title size="small"></r4-title> URL
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="service_url"><r4-title></r4-title> track URL</label>
					<input
						readonly
						name="service_url"
						type="url"
						.value="${this.trackOriginUrl}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	buildMediaUrlDom() {
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareMedia}">
						Share Media URL
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="media_url">Media URL</label>
					<input
						readonly
						name="media_url"
						type="url"
						.value="${this.track.url}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	buildDiscogsUrlDom() {
		if (!this.track.discogs_url) return html``;
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareDiscogs}">
						Share Discogs URL
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="discogs_url">Discogs URL</label>
					<input
						readonly
						name="discogs_url"
						type="url"
						.value="${this.track.discogs_url}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	buildRepostDom() {
		return html`
			<fieldset>
				<span>
					<a name="r4_add" href="${this.shareToR4Url}">
						Share on <r4-title></r4-title>
					</a>
				</span>
			</fieldset>
		`;
	}

	render() {
		return html`
			<form>
				${this.buildServiceUrlDom()}
				${this.buildMediaUrlDom()}
				${this.buildDiscogsUrlDom()}
				${this.buildRepostDom()}
			</form>
		`;
	}

	createRenderRoot() {
		return this;
	}
}
