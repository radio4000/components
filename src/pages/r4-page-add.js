import { LitElement, html } from 'lit'
import { readChannel } from '@radio4000/sdk'

export default class R4PageAdd extends LitElement {
	static properties = {
		href: { type: String, reflect: true },
		url: { type: String, reflect: true },
		channel: { type: String, reflect: true },
		channelId: { type: String, attribute: 'channel-id', reflect: true },
		singleChannel: { type: Boolean, attribute: 'single-channel', reflect: true },
	}

	async connectedCallback() {
		super.connectedCallback()
		this.channelId = await this.findSelectedChannel()
	}

	render() {
		return html`
			${!this.singleChannel ? this.renderHeader() : '' }
			<main>
				<r4-track-create channel-id="${this.channelId}" url="${this.url}" @submit="${this.onTrackCreate.bind(this)}"></r4-track-create>
			</main>
		`
	}

	renderHeader() {
		return html`
			<header>
				Adding to: <r4-user-channels-select channel="${this.channel}" @input="${this.onChannelSelect.bind(this)}"></r4-user-channels-select>
			</header>
		`
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await readChannel(this.channel)
		if (data && data.id) {
			return data.id
		}
	}

	onChannelSelect({ detail }) {
		const { channel } = detail
		if (channel) {
			this.channel = channel.slug
		}
	}

	onTrackCreate({detail}) {
		console.log('track submit', detail)
		if (detail.data) {
			/* remove the url, because added ? */
			this.url = null
			/* set the channel id attribute (since the form cleared on success) */
			this.updateAttributes()
			this.focus()
		}
	}
	createRenderRoot() {
		return this
	}
}
