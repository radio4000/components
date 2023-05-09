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
			<a href="${this.url}">
				<r4-avatar image=${channel.image}></r4-avatar>
			</a>
			<div>
				<h1><a href="${this.url}">${channel.slug}</a></h1>
				<p class="slug">@<a href="${this.url}">${channel.slug}</a></p>
				<p class="desc">${channel.description}</p>
			</div>
			<r4-button-play .channel=${channel}></r4-button-play>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
