import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageAdd extends BaseChannel {
	static properties = {
		selectedSlug: {type: String, state: true},
		selectedId: {type: String, state: true},
		lastAddedTrack: {type: Object, state: true},
	}
	/* overwritte for the add page */
	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/${this.selectedSlug}`
	}
	get selectedSlug() {
		if (this.hasOneChannel) {
			return this.store.userChannels[0].slug
		} else if (this?.searchParams?.slug) {
			return this?.searchParams?.slug
		} else if (this.config.selectedSlug) {
			return this.config.selectedSlug
		}
		return ''
	}
	get selectedId() {
		return this.channel?.id
	}
	get selectedChannelOrigin() {
		return `${this.config.href}/${this.selectedSlug}`
	}
	async connectedCallback() {
		super.connectedCallback()
		if (this.selectedSlug) {
			this.channel = await this.findSelectedChannel()
		}
	}
	async findSelectedChannel() {
		const {data} = await sdk.channels.readChannel(this.selectedSlug)
		return data
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
	onTrackCreate({detail}) {
		if (detail.data) {
			this.lastAddedTrack = detail.data
			this.focus()
		}
	}
	renderHeader() {
		return html`
			<menu>
				<li>
					<h1><a aria href="${this.config.href}/add?slug=${this.selectedSlug}">Add track</a></h1>
				</li>
				<li>
					<a aria href="${this.config.href}/${this.selectedSlug}">
						<r4-channel-slug> ${this.selectedSlug} </r4-channel-slug>
					</a>
				</li>
			</menu>
		`
	}
	renderMain() {
		return [this.renderAdd(), this.lastAddedTrack ? this.renderLastAddedTrack() : null]
	}
	renderAdd() {
		return html`
			<p>Add a new track by linking to the URL address of a media.</p>
			<r4-track-create
				channel_id=${this.selectedId}
				url=${this.searchParams.get('url')}
				@submit=${this.onTrackCreate}
			></r4-track-create>
		`
	}
	renderLastAddedTrack() {
		return html`
			<r4-list>
				<r4-list-item>
					<r4-track
						.track=${this.lastAddedTrack}
						.canEdit="${this.canEdit}"
						.channel="${this.channel}"
						href="${this.config.href}"
						origin="${this.selectedChannelOrigin}/tracks/"
					></r4-track>
				</r4-list-item>
			</r4-list>
		`
	}

	createRenderRoot() {
		return this
	}
}
