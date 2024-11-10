import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageAdd extends BaseChannel {
	static properties = {
		selectedSlug: {type: String, state: true},
		selectedId: {type: String, state: true},
		lastAddedTrack: {type: Object, state: true},
		originalTrackId: {type: String, state: true},
		originalTrack: {type: Object, state: true},
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
	get originalTrackId() {
		if (this?.searchParams.has('track_id')) {
			return this?.searchParams.get('track_id')
		}
	}
	async connectedCallback() {
		super.connectedCallback()

		this.originalTrack = {}

		if (!this.store.user) {
			page(`/sign/up/`)
		} else {
			if (this.selectedSlug) {
				this.channel = await this.findSelectedChannel()
			}
		}

		if (this.originalTrackId) {
			const {data: track} = await sdk.tracks.readTrack(this.originalTrackId)
			if (track) {
				const {data: channel} = await sdk.supabase
					.from('channel_track')
					.select(
						`
					channel_id!inner(
						slug
					)
				`,
					)
					.eq('track_id', track.id)
					.single()
				if (channel) {
					const {slug: originalChannelSlug} = channel.channel_id
					this.originalTrack = {
						url: track.url,
						title: track.title,
						discogs_url: track.discogs_url,
						description: `Thanks @${originalChannelSlug}; ${track.description}`,
					}
					console.log(this.originalTrack)
				}
			}
		} else if (this.searchParams.get('url')) {
			this.originalTrack = {
				url: this.searchParams.get('url'),
				title: this.searchParams.get('title'),
				discogs_url: this.searchParams.get('discogs_url'),
				description: this.searchParams.get('description'),
			}
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
			<section>
				<p>Add a new track by linking to the URL address of a media.</p>
				<r4-track-create
					channel_id=${this.selectedId}
					discogs_url=${this.originalTrack.discogs_url}
					description=${this.originalTrack.description}
					title=${this.originalTrack.title}
					url=${this.originalTrack.url}
					@submit=${this.onTrackCreate}
				></r4-track-create>
			</section>
		`
	}
	renderLastAddedTrack() {
		return html`
			<section>
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
			</section>
		`
	}

	createRenderRoot() {
		return this
	}
}
