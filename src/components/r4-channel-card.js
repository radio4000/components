import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

/**
 * Renders an image in a predefined format for channel avatars.
 * There are two ways to tell the component what to render
 * 1. Pass in an `image` with the Cloudinary image id
 * 2. Pass in a `slug` with the channel slug. This will cause a network request to happen
 */
export default class R4ChannelCard extends LitElement {
	static properties = {
		slug: {type: String, reflect: true},
		origin: {type: String},
		channel: {type: Object, state: true},
	}

	get url() {
		return this.origin?.replace('{{slug}}', this.channel.slug)
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.slug) {
			const {data} = await sdk.channels.readChannel(this.slug)
			this.channel = data
		}
	}

	play() {
		const playEvent = new CustomEvent('r4-play', {
			bubbles: true,
			detail: {channel: this.channel},
		})
		this.dispatchEvent(playEvent)
	}

	render() {
		if (!this.channel) {
			return html`Loading...`
		}
		return html`
			<r4-button-play .channel=${this.channel}></r4-button-play>
			<a href="${this.url}">
				${this.renderAvatar()}
				<r4-channel-name>${this.channel.name}</r4-channel-name>
				<r4-channel-slug>@${this.channel.slug}</r4-channel-slug>
			</a>
			${this.renderDescription()} ${this.renderUrl()}
		`
	}
	renderDescription() {
		if (this.channel.description) {
			return html`<r4-channel-description> ${this.channel.description} </r4-channel-description>`
		}
	}
	renderAvatar() {
		if (this.channel.image) {
			return html`<r4-avatar size="small" image=${this.channel.image}></r4-avatar>`
		}
	}
	renderUrl() {
		if (this.channel.url) {
			return html`
				<r4-channel-url>
					<a target="_blank" ref="norel noreferer" href=${this.channel.url}> ${this.channel.url} </a>
				</r4-channel-url>
			`
		}
	}
	createRenderRoot() {
		return this
	}
}
