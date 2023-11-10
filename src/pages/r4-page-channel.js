import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'

export default class R4PageChannel extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		// from base channel
		// channel: {type: Object, state: true},
		// channelError: {type: Object, state: true},
		// canEdit: {type: Boolean, state: true},
		// alreadyFollowing: {type: Boolean, state: true},
		// followsYou: {type: Boolean, state: true},
		// isFirebaseChannel: {type: Boolean, state: true},
		// from router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
	}

	constructor() {
		super()
		this.query = {
			table: 'channel_tracks',
		}
	}

	handleData(event) {
		this.tracks = event.detail.data
	}

	renderAside() {
		return html`
			<r4-base-query
				.defaultFilters=${[{operator: 'eq', column: 'slug', value: this.channel?.slug}]}
				.initialQuery=${this.query}
				@data=${this.handleData}
			></r4-base-query>
			${this.channel ? this.renderChannelShare() : null}
		`
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html`<radio4000-player channel-slug=${this.params.slug}></radio4000-player>`
		}
		// if (this.channelError) {}
		if (this.channel) {
			return html` <section>${this.renderTracksList()}</section> `
		}
	}

	renderTracksList() {
		if (!this.tracks) return null
		return html`
			<r4-list>
				${repeat(
					this.tracks,
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
