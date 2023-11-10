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
			${this.renderTracksMenu()}
			<r4-base-query
				.defaultFilters=${[{operator: 'eq', column: 'slug', value: this.channel?.slug}]}
				.initialQuery=${this.query}
				.searchParams=${this.searchParams}
				@data=${this.handleData}
			></r4-base-query>
		`
	}

	renderMain() {
		if (this.channel) {
			return this.renderTracksList()
		}
	}

	renderTracksList() {
		if (this.tracks?.length) {
			return html` <r4-list> ${this.renderListItems()} </r4-list> `
		} else {
			return html`
				<r4-list>
					<r4-list-item>No tracks found for this query</r4-list-item>
				</r4-list>
			`
		}
	}

	renderListItems() {
		return repeat(
			this.tracks,
			(t) => t.id,
			(t) => html`
				<r4-list-item>
					<r4-track
						.track=${t}
						.channel=${this.channel}
						.config=${this.config}
						.canEdit=${this.canEdit}
						href=${this.config.href}
						origin=${this.tracksOrigin}
					></r4-track>
				</r4-list-item>
			`,
		)
	}

	renderTracksMenu() {
		if (!this.tracks) return null
		return html`
			<menu>
				<li><a href=${this.channelOrigin}>@${this.slug}</a></li>
				<li><r4-button-play .channel=${this.channel} label=" Play all"></r4-button-play></li>
				<li>
					<r4-supabase-filter-search
						search=${this.query?.search}
						placeholder="${this.count + ' tracks'}"
						@input=${this.onSearch}
					></r4-supabase-filter-search>
				</li>
				<li>
					<r4-button-play
						.tracks=${this.tracks}
						.channel=${this.channel}
						.filters=${this.filters}
						label="Play results"
					></r4-button-play>
				</li>
			</menu>
		`
	}

	renderNoPage() {
		return html` <r4-page-main> 404 - No channel with this slug </r4-page-main> `
	}
}
