import { LitElement, html } from 'lit';

/**
 * Form with shareable URLs and embeds for a channel
 */
export default class R4ShareChannel extends LitElement {
	static get properties() {
		return {
			origin: { type: String },
			playerOrigin: { type: String, attribute: 'player-origin' },
			iconOrigin: { type: String, attribute: 'icon-origin' },
			channel: { type: Object },
			canNavigatorShare: { type: Boolean }
		};
	}

	constructor() {
		super();
		this.playerOrigin = 'https://player.radio4000.com/v2';
		this.iconOrigin = 'https://assets.radio4000.com/icon-r4.svg';
		this.channel = {};
		this.canNavigatorShare = !!navigator.share;
	}


	get channelUrl() {
		return this.origin
	}

	get iframeHtml() {
		return `<iframe src="${this.playerOrigin}/?slug=${this.channel.slug}" width="320" height="500" frameborder="0"></iframe>`;
	}

	// Compute the icon HTML code
	get iconHtml() {
		return `<a href="${this.origin}"><img width="30" src="${this.iconOrigin}" title="${this.channel.slug}@r4" alt="${this.channel.slug}@r4"></a>`;
	}

	shareChannelUrl() {
		if (navigator.share) {
			navigator.share({
				url: this.channelUrl
			})
			.catch((error) => console.error('Error sharing channel URL:', error));
		}
	}

	shareChannelIframe() {
		if (navigator.share) {
			navigator.share({
				text: this.iframeHtml,
			})
			.catch((error) => console.error('Error sharing channel embed:', error));
		}
	}

	shareChannelIcon() {
		if (navigator.share) {
			navigator.share({
				text: this.iconHtml
			})
			.catch((error) => console.error('Error sharing channel icon:', error));
		}
	}

	buildChannelUrlDom() {
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareChannelUrl}">
						Share channel URL
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="channel_url">Channel URL</label>
					<input
						readonly
						name="channel_url"
						type="url"
						.value="${this.channelUrl}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	buildChannelIframeDom() {
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareChannelIframe}">
						Share &lt;iframe&gt; embed code
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="channel_iframe">Channel &lt;iframe&gt; embed code</label>
					<input
						readonly
						name="channel_iframe"
						type="text"
						.value="${this.iframeHtml}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	buildChannelIconDom() {
		if (this.canNavigatorShare) {
			return html`
				<fieldset>
					<button type="button" @click="${this.shareChannelIcon}">
						Share channel icon link
					</button>
				</fieldset>
			`;
		} else {
			return html`
				<fieldset>
					<label for="channel_icon">Channel icon link</label>
					<input
						readonly
						name="channel_icon"
						type="text"
						.value="${this.iconHtml}"
						@click="${this.onInputClick}"
					/>
				</fieldset>
			`;
		}
	}

	// -------------------------
	// Fallback: select text on click
	// -------------------------
	onInputClick(event) {
		event.target.select();
	}

	render() {
		return html`
			<form>
				${this.buildChannelUrlDom()}
				${this.buildChannelIframeDom()}
				${this.buildChannelIconDom()}
			</form>
		`;
	}

	createRenderRoot() {
		return this;
	}
}
