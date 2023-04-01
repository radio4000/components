import { LitElement, html } from 'lit'
import { readChannel } from '@radio4000/sdk'

export default class R4PageAdd extends LitElement {
	static properties = {
		href: { type: String, reflect: true },
		url: { type: String, reflect: true },
		channel: { type: String, reflect: true },
		slug: { type: String, reflect: true },
		channelId: {
			type: String,
			attribute: 'channel-id',
			reflect: true,
			state: true,
		},
		singleChannel: {
			type: Boolean,
			attribute: 'single-channel',
			reflect: true,
		},
		store: { type: Object },
	}

	async connectedCallback() {
		super.connectedCallback()

		// Choose the channel to add the track to.
		if (this.channel || this.slug) {
			this.channelId = await this.findSelectedChannel()
		} else {
			this.channelId = this.store.userChannels[0].id
		}

		this.requestUpdate()
	}

	render() {
		return html`
			${!this.singleChannel ? this.renderHeader() : ''}
			<main>
				${this.renderAdd()}
			</main>
		`
	}

	renderHeader() {
		const slug = this.channel || this.slug || this.store.userChannels && this.store.userChannels[0].slug
		return html`
			<header>
				<span>Add track to</span>
				<r4-user-channels-select
					channel=${slug}
					@input=${this.onChannelSelect}
				></r4-user-channels-select>
			</header>
		`
	}

	renderAdd() {
		return html`
			<r4-track-create
				channel-id=${this.channelId}
				url=${this.url}
				@submit=${this.onTrackCreate}
				></r4-track-create>
		`
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await readChannel(this.channel || this.slug)
		if (data && data.id) {
			return data.id
		}
	}

	async onChannelSelect({ detail }) {
		const { channel } = detail
		if (channel) {
			this.channel = channel.slug
			this.channelId = await this.findSelectedChannel()
			this.requestUpdate('channel')
		}
	}

	onTrackCreate({ detail }) {
		console.log('track submit', detail)
		if (detail.data) {
			/* remove the url, because added ? */
			this.url = null
			/* set the channel id attribute (since the form cleared on success) */
			this.focus()
			this.querySelector('form').insertAdjacentHTML(
				'afterend',
				'<p>Track added!</p>'
			)
		}
	}
	createRenderRoot() {
		return this
	}
}
