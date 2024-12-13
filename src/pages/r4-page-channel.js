import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '../libs/sdk.js'
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
		this.tracks = []
	}

	async connectedCallback() {
		await super.connectedCallback()
		if (this.channel) {
			const {data: track} = await sdk.supabase
				.from('channel_track')
				.select(`track_id(updated_at)`)
				.eq('channel_id', this.channel.id)
				.order('updated_at', {ascending: false})
				.limit(1)
				.single()
			if (track) {
				this.tracks = [track.track_id]
			}
		}
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html` <radio4000-player channel-slug=${this.params.slug}></radio4000-player> `
		}
		// if (this.channelError) {}
		if (this.channel) {
			return html`
				<section>
					${[this.renderChannelCard(), this.renderTracksList(), this.renderTimes()]}
				</section>
			`
		}
	}

	renderChannelCard() {
		return html` <r4-channel-card .channel=${this.channel} origin=${this.channelOrigin} href=${this.config.href} full="true"></r4-channel-card> `
	}

	renderTracksList() {
		if (!this.tracks?.length) {
			if (this.canEdit) {
				return html`
					<p><a href="${this.config.href}/add?slug=${this.channel.slug}"> Add a first track</a> into the radio channel.</p>
				`
			} else {
				return html`<p>This channel does not yet have any track.</p>`
			}
		} else {
			return html`<p><a href="${this.channelOrigin + '/tracks'}"> Explore tracks </a></p>`
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
		return html`<p>${doms}</p>`
	}
}
