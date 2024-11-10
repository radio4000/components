import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'
import {formatDate, isFreshDate, relativeDate, relativeDateSolar} from '../libs/date.js'

export default class R4PageChannel extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		// from base channel
		channel: {type: Object, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true},
		isFirebaseChannel: {type: Boolean, state: true},
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
		this.tracks = []
	}

	onData(event) {
		this.tracks = event.detail.data
	}

	renderAside() {
		return html`
			<r4-query
				.defaultFilters=${[{operator: 'eq', column: 'slug', value: this.channel?.slug}]}
				.initialQuery=${this.query}
				@data=${this.onData}
			></r4-query>
			${super.renderAside()}
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
				<section>${this.renderTimes()}</section>
				<p><a href="${this.channelOrigin + '/tracks'}"> Explore tracks </a></p>
			`
		}
	}

	renderChannelCard() {
		return html` <r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card> `
	}

	renderTracksList() {
		if (!this.tracks.length) {
			if (this.canEdit) {
				return html`
					<p><a href="${this.config.href}/add?slug=${this.channel.slug}"> Add </a> a first track into the radio.</p>
				`
			} else {
				return html`<p>This channel does not yet have any track.</p>`
			}
		}
	}
	renderTimes() {
		const lastTrack = this.tracks[0]
		if (!lastTrack) return
		const doms = []
		if (isFreshDate(lastTrack.updated_at)) {
			doms.push(html`<span>Last updated <date>${relativeDate(lastTrack?.updated_at)}</date>.</span>`)
			doms.push(' ')
		}
		const since = formatDate(this.channel.created_at)
		const sinceRelative = relativeDate(this.channel.created_at)
		doms.push(
			html`<span>
				Broadcasting since
				<date
					time=${since}
					title="Broacasting since ${since}, ${sinceRelative}; with love, from earth 🏴 🌬️ 📻 🌊 🌍 🪐 ✨"
					>${relativeDateSolar(this.channel.created_at)}</date
				>.
			</span>`,
		)
		return doms
	}
}
