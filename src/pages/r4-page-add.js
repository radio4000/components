import { LitElement, html } from 'lit'
import { readChannel } from '@radio4000/sdk'

export default class R4PageAdd extends LitElement {
	static properties = {
		/* props */
		store: { type: Object },
		query: { type: Object },
		href: { type: String, reflect: true },
		singleChannel: { type: Boolean, attribute: 'single-channel', reflect: true},
		/* state */
		channelSlug: {attribute: 'channel'},
		channelId: { type: String, reflect: true, state: true },
	}

	get selectedSlug() {
		this?.query?.channel || this.slug || this.store.userChannels && this.store.userChannels[0].slug
	}

	async connectedCallback() {
		super.connectedCallback()

		// Choose the channel to add the track to.
		if (this?.query?.channel || this.slug) {
			this.channelId = await this.findSelectedChannel()
		} else {
			this.channelId = this.store.userChannels[0].id
		}

		this.requestUpdate()
	}

	async onChannelSelect({ detail }) {
		const { channel } = detail
		console.log('channel select', channel)
		if (channel) {
			this.channel = channel.slug
			this.channelId = await this.findSelectedChannel()
			this.requestUpdate()
		}
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		console.log('find selected channel', this.query, this.params)
		const { data } = await readChannel(this?.query?.channel || this.slug)
		if (data && data.id) {
			console.log('add channel id', data.id)
			return data.id
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

	render() {
		return html`
			${!this.singleChannel ? this.renderHeader() : ''}
			<main>
				${this.renderAdd()}
			</main>
		`
	}

	renderHeader() {
		const slug = this.selectedSlug
		return html`
			<header>
				<span><strong>Add</strong> track to</span>
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
				url=${this?.query?.url}
				@submit=${this.onTrackCreate}
				></r4-track-create>
		`
	}
	createRenderRoot() {
		return this
	}
}
