import {LitElement, html} from 'lit'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import {linkEntities} from '../libs/link-tags-mentions.js'
import {sdk} from '../libs/sdk.js'

/**
 * Renders a linkable preview card for a channel.
 */
export default class R4ChannelCard extends LitElement {
	static properties = {
		/** If true, the card shows all info */
		full: {type: Boolean},
		href: {type: String},
		origin: {type: String},
		/** If defined, the card will fetch the channel on load and set it. */
		slug: {type: String, reflect: true},
		/** A regular R4 channel object */
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
			return html`<r4-loading></r4-loading>`
		}
		return html`
			<r4-button-play .channel=${this.channel}></r4-button-play>
			${this.renderAvatar()}
			<r4-channel-link>
				<a href="${this.url}">
					<r4-channel-name>${this.channel.name}</r4-channel-name>
					<r4-channel-slug>${this.channel.slug}</r4-channel-slug>
				</a>
			</r4-channel-link>
			<r4-channel-card-body> ${this.full ? [this.renderDescription(), this.renderUrl()] : null} </r4-channel-card-body>
		`
	}
	renderDescription() {
		if (this.channel.description) {
			const tracksOrigin = `${this.origin}/tracks`
			const withLinks = unsafeHTML(linkEntities(this.channel.description, this.href, tracksOrigin))
			return html`<r4-channel-description> ${withLinks} </r4-channel-description>`
		}
	}
	renderAvatar() {
		if (this.channel.image) {
			return html`<r4-avatar size="medium" image=${this.channel.image} href=${this.url}></r4-avatar>`
		}
	}
	renderUrl() {
		if (this.channel.url && this.channel.url.startsWith('https://')) {
			return html`
				<r4-channel-url>
					<a target="_blank" ref="norel noreferer nofollow" href=${this.channel.url}> ${this.channel.url} </a>
				</r4-channel-url>
			`
		}
	}
	createRenderRoot() {
		return this
	}
}
