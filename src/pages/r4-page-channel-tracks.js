import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},

		// from BaseChannel
		channel: {type: Object, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true},
		alreadyFollowing: {type: Boolean, state: true},
		followsYou: {type: Boolean, state: true},
		isFirebaseChannel: {type: Boolean, state: true},

		// from router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
		// other
		href: {type: String},
		origin: {type: String},
	}

	constructor() {
		super()
		this.query = {
			table: 'channel_tracks',
			/* to fit in "one screen size, and browse by page" */
			limit: 10,
		}
	}

	handleData(event) {
		const {data: tracks, count} = event.detail
		this.tracks = tracks
		this.count = count
	}

	renderHeader() {
		if (this.channelError) return this.renderNoPage()

		return html`
			<menu>
				<li>
					<h1>
						<a href=${this.channelOrigin}>
							<r4-channel-slug> ${this.slug} </r4-channel-slug>
						</a>
					</h1>
				</li>
				<li>
					<form @submit=${(event) => event.preventDefault()}>
						<fieldset>
							<r4-button-play .channel=${this.channel} label="all"></r4-button-play>
							<r4-button-play
								.tracks=${this.tracks}
								.channel=${this.channel}
								.filters=${this.filters}
								label="results"
							></r4-button-play>
						</fieldset>
					</form>
				</li>
				<li>
					<r4-query
						.defaultFilters=${[{operator: 'eq', column: 'slug', value: this.channel?.slug}]}
						.initialQuery=${this.query}
						.searchParams=${this.searchParams}
						@data=${this.handleData}
					></r4-query>
				</li>
			</menu>
		`
	}

	renderMain() {
		if (this.channel) {
			return this.renderTracksList()
		}
	}

	renderTracksList() {
		if (this.tracks?.length) {
			return html`<r4-list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => this.renderTrackItem(t),
				)}
			</r4-list> `
		} else {
			return html`
				<r4-list>
					<r4-list-item>No tracks found for this query</r4-list-item>
				</r4-list>
			`
		}
	}

	renderNoPage() {
		return html` <r4-page-main> 404 - No channel with this slug </r4-page-main> `
	}
}
