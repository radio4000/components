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
	}

	async connectedCallback() {
		super.connectedCallback()
		this.channelId = await this.findSelectedChannel()
		// console.log(
		// 	'connectedCallback',
		// 	this,
		// 	this.channelId,
		// 	this.slug,
		// 	this.channel
		// )
		this.requestUpdate()
	}

	render() {
		console.log('page store', this.store)
		return html`
			${!this.singleChannel ? this.renderHeader() : ''}
			<main>
				${this.renderAdd()}
			</main>
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
