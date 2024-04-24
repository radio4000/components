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
			<r4-query
				.defaultFilters=${[{operator: 'eq', column: 'slug', value: this.channel?.slug}]}
				.initialQuery=${this.query}
				@data=${this.handleData}
			></r4-query>
			${this.channel ? this.renderChannelShare() : null}
		`
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html` <radio4000-player channel-slug=${this.params.slug}></radio4000-player> `
		}
		// if (this.channelError) {}
		if (this.channel) {
			return html`
				<section>${this.renderChannelCard()}</section>
				<section>${this.renderTracksList()}</section>
			`
		}
	}
	renderChannelCard() {
		return html` <r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card> `
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
}
