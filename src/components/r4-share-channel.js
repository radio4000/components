import {LitElement, html} from 'lit'

export default class R4ShareChannel extends LitElement {
	static get properties() {
		return {
			origin: {type: String},
			playerOrigin: {type: String, attribute: 'player-origin'},
			iconOrigin: {type: String, attribute: 'icon-origin'},
			channel: {type: Object},
		}
	}

	constructor() {
		super()
		this.playerOrigin = 'https://player.radio4000.com/v2'
		this.iconOrigin = 'https://assets.radio4000.com/icon-r4.svg'
		this.channel = {}
	}

	get iframeHtml() {
		return `<iframe src="${this.playerOrigin}/?slug=${this.channel.slug}" width="320" height="500" frameborder="0"></iframe>`
	}

	get iconHtml() {
		return `<a href="${this.origin}"><img width="30" src="${this.iconOrigin}" title="${this.channel.slug}@r4" alt="${this.channel.slug}@r4"></a>`
	}

	render() {
		const channelUrl = this.origin && this.channel.slug ? this.origin.replace('{{slug}}', this.channel.slug) : ''
		return html`
			<form>
				<fieldset>
					<label for="channel_url">Channel URL</label>
					<input readonly name="channel_url" type="url" value="${channelUrl}" @click="${this.onInputClick}" />
				</fieldset>
				<fieldset>
					<label for="channel_iframe">Channel &lt;iframe&gt;</label>
					<input readonly name="channel_iframe" type="url" value="${this.iframeHtml}" @click="${this.onInputClick}" />
				</fieldset>
				<fieldset>
					<label for="channel_icon">Channel Icon</label>
					<input readonly name="channel_icon" type="url" value="${this.iconHtml}" @click="${this.onInputClick}" />
				</fieldset>
			</form>
		`
	}

	onInputClick(event) {
		event.target.select()
	}
}
