import { LitElement, html } from 'lit'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageAdd extends LitElement {
	static properties = {
		/* props */
		store: { type: Object, state: true },
		query: { type: Object, state: true },
		config: { type: Object, state: true },

		/* state */
		selectedSlug: { type: String, state: true },
		selectedId: { type: String, state: true },
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	get selectedSlug() {
		if (this.hasOneChannel) {
			return this.store.userChannels[0].slug
		} else if (this?.query?.slug) {
			return this?.query?.slug
		} else if (this.config.selectedSlug) {
			return this.config.selectedSlug
		}
	}
	set selectedSlug(val) {
		return val
	}

	async connectedCallback() {
		super.connectedCallback()

		// Choose the channel to add the track to.
		console.log('connected this.query', this.query)
		if (this.selectedSlug) {
			this.selectedId = await this.findSelectedChannel()
		}

		this.requestUpdate()
	}

	async onChannelSelect({ detail }) {
		console.log('select channel', detail?.channel)
		if (detail?.channel?.slug) {
			this.selectedSlug = detail?.channel?.slug
		}
		if (detail?.channel?.id) {
			this.selectedId = detail?.channel?.id
		}
		page(`/add?slug=${detail?.channel?.slug}`)
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await readChannel(this.selectedSlug)
		if (data && data.id) {
			return data.id
		}
	}

	onTrackCreate({ detail }) {
		if (detail.data) {
			/* remove the url, because added ? */
			/* set the channel id attribute (since the form cleared on success) */
			this.focus()
		}
	}

	render() {
		return html`
			${!this.config.singleChannel ? this.renderHeader() : ''}
			<main>
				${this.renderAdd()}
			</main>
		`
	}

	renderHeader() {
		const $channelsSelect = html`
			<p>${this.selectedSlug}</p>
			<r4-user-channels-select
				channel=${this.selectedSlug}
				@input=${this.onChannelSelect}
				></r4-user-channels-select>
		`

		const $channelLink = html`
			<a href=${this.config.href + '/' + this.selectedSlug}>
				${this.selectedSlug}
			</a>
		`

		return html`
			<header>
				<span>Add track to</span>
				${this.hasOneChannel ? $channelLink : $channelsSelect}
			</header>
		`
	}

	renderAdd() {
		return html`
			<r4-track-create
				channel-id=${this.selectedId}
				url=${this.query.url}
				@submit=${this.onTrackCreate}
				></r4-track-create>
		`
	}
	createRenderRoot() {
		return this
	}
}
