import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageAdd extends BaseChannel {
	static properties = {
		selectedSlug: {type: String, state: true},
		selectedId: {type: String, state: true},
		lastAddedTrack: {type: Object, state: true},
	}

	get selectedSlug() {
		if (this.hasOneChannel) {
			return this.store.userChannels[0].slug
		} else if (this?.searchParams?.slug) {
			return this?.searchParams?.slug
		} else if (this.config.selectedSlug) {
			return this.config.selectedSlug
		}
		return undefined
	}
	// set selectedSlug(val) {
	// 	return val
	// }

	async connectedCallback() {
		super.connectedCallback()
		if (this.selectedSlug) {
			this.selectedId = await this.findSelectedChannel()
		}
		this.requestUpdate()
	}

	async onChannelSelect({detail}) {
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
		const {data} = await sdk.channels.readChannel(this.selectedSlug)
		if (data?.id) return data.id
	}

	onTrackCreate({detail}) {
		if (detail.data) {
			this.lastAddedTrack = detail.data
			this.focus()
		}
	}

	render() {
		const link = `${this.config.href}/${this.selectedSlug}`
		const $channelsSelect = html`<r4-user-channels-select
			channel=${this.selectedSlug}
			@input=${this.onChannelSelect}
		></r4-user-channels-select>`

		return html`
			<r4-page-header>
				<nav>
					<nav-item
						>${this.hasOneChannel
							? html`<code>@</code><a href=${link}>${this.selectedSlug}</a>`
							: $channelsSelect}</nav-item
					>
					<nav-item><code>></code> <a href=${link + '/tracks'}>Tracks</a></nav-item>
					<nav-item>Add</nav-item>
				</nav>
			</r4-page-header>
			<r4-page-main>
				${this.renderAdd()}
				${this.lastAddedTrack
					? html`Added track:
							<a href=${`${this.config.href}/${this.selectedSlug}/tracks/${this.lastAddedTrack.id}`}
								>${this.lastAddedTrack.title}</a
							>`
					: null}
			</r4-page-main>
		`
	}

	renderAdd() {
		return html`
			<r4-track-create
				channel-id=${this.selectedId}
				url=${this.searchParams.get('url')}
				@submit=${this.onTrackCreate}
			></r4-track-create>
		`
	}

	createRenderRoot() {
		return this
	}
}
