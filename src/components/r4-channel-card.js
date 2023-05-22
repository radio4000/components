import { LitElement, html } from 'lit'
import { sdk } from '@radio4000/sdk'

/**
 * Renders an image in a predefined format for channel avatars.
 * There are two ways to tell the component what to render
 * 1. Pass in an `image` with the Cloudinary image id
 * 2. Pass in a `slug` with the channel slug. This will cause a network request to happen
 */
export default class R4ChannelCard extends LitElement {
	static properties = {
		slug: { type: String, reflect: true },
		origin: { type: String },
		channel: { type: Object, state: true },
	}

	get url() {
		return this.origin?.replace('{{slug}}', this.channel.slug)
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.slug) {
			const { data } = await sdk.channels.readChannel(this.slug)
			this.channel = data
		}
	}

	play() {
		const playEvent = new CustomEvent('r4-play', {
			bubbles: true,
			detail: { channel: this.channel },
		})
		this.dispatchEvent(playEvent)
	}

	render() {
		const { channel } = this
		if (!channel) return html`Loading...`
		return html`
			<r4-button-play .channel=${channel}></r4-button-play>
			<r4-slug><a href="${this.url}">@${channel.slug}</a></r4-slug>
			<r4-avatar image=${channel.image}></r4-avatar>
			<r4-name aria-heading="1">${channel.name}</r4-name>
			<r4-description>${channel.description}</r4-description>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
