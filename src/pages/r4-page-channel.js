import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'

export default class R4PageChannel extends BaseChannel {
	constructor() {
		super()
		this.query = {
			table: 'channel_tracks',
			limit: 8
		}
	}

	get defaultFilters() {
		return [{operator: 'eq', column: 'slug', value: this.channel?.slug}]
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html`<radio4000-player channel-slug=${this.params.slug}></radio4000-player>`
		}
		// if (this.channelError) {}
		if (this.channel) {
			return html`
				<section>${this.renderQuery()}</section>
				<section>${this.renderTracksList()}</section> `
		}
	}

	renderTracksList() {
		if (!this.data) return null
		return html`
			<r4-list>
				${repeat(
					this.data,
					(t) => t.id,
					(t) => this.renderTrackItem(t),
				)}
			</r4-list>
		`
	}

	renderTrackItem(track) {
		return html`
			<r4-list-item>
				<r4-track
					.track=${track}
					.channel=${this.channel}
					.canEdit=${this.canEdit}
					href=${this.config.href}
					origin=${this.tracksOrigin}
					?playing=${this.config.playingTrack?.id === track.id}
				></r4-track>
			</r4-list-item>
		`
	}
}
