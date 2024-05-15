import {html} from 'lit'
import BaseChannel from './base-channel'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '../libs/sdk.js'
import {formatDate} from '../libs/date.js'

/* should probably refactor this page into a r4-feed,
	 with correct markup and attributes */
export default class R4PageChannelFeed extends BaseChannel {
	static properties = {
		limit: {type: Number, reflect: true},
		tracks: {type: Array, state: true},
		params: {type: Object, state: true},
	}
	constructor() {
		super()
		this.limit = 200
	}

	async connectedCallback() {
		await super.connectedCallback()
		this.following = (await sdk.channels.readFollowings(this.channel.id)).data
		if (this.following) {
			this.loadTracks().then((tracks) => {
				this.tracks = tracks
			})
		}
	}

	async loadTracks() {
		// Create string of slugs to query.
		const orQuery = this.following.map((c) => `slug.eq.${c.slug}`).join(',')
		// Latest X tracks, newest first
		const res = await sdk.supabase
			.from('channel_tracks')
			.select('*')
			.or(orQuery)
			.order('created_at', {ascending: false})
			.limit(this.limit)
		return res.data
	}

	renderMain() {
		return this.renderGroups()
	}

	renderGroups() {
		if (!this.tracks) {
			return html` <section>Cannot build feed if not following any channel.</section> `
		}
		const groups = groupTracks(this.tracks)
		/* console.info(groups) */
		return html` <r4-list> ${groups.map((g) => html`<r4-list-item>${this.renderMonth(g)}</r4-list-item>`)} </r4-list> `
	}

	renderMonth(group) {
		const {href} = this.config
		return html`
			<r4-list>
				<h2>${group.month}</h2>
				${repeat(
					group.groups,
					(x) => x.month,
					(x) => html`<r4-list-item>${this.renderGroup(x)}</r4-list-item>`,
				)}
			</r4-list>
		`
	}

	renderGroup(group) {
		const groupChannel = this.following.find(({slug}) => slug === group.slug)
		return html`
			<r4-list>
				<r4-channel-card slug=${group.slug} origin=${this.config.href + '/{{slug}}'}></r4-channel-card>
				${repeat(
					group.tracks,
					(track) => track.id,
					(track) => this.renderTrackItem(track, group, groupChannel),
				)}
			</r4-list>
		`
	}
	renderTrackItem(track, group, channel) {
		return html`
			<r4-list-item>
				<date>${formatDate(track.created_at)}</date>
				<r4-track
					.track=${track}
					.channel=${channel}
					.config=${this.config}
					href=${this.config.href}
					origin=${this.config.href + '/' + channel.slug + '/tracks/'}
				></r4-track>
			</r4-list-item>
		`
	}
}

/**
 * Sorts and groups tracks by date and slug.
 * @param {Array} tracks
 * @returns {Array.<{slug: String, tracks: Array}>} groups
 */
function groupTracks(tracks) {
	const groups = []

	for (const track of tracks) {
		const month = track.created_at.slice(0, 7)

		// Make sure there is a group for the month.
		let monthGroup = groups.find((g) => g.month === month)
		if (!monthGroup) {
			monthGroup = {month, groups: []}
			groups.push(monthGroup)
		}

		// Make sure there is a group for the radio.
		let radioGroup = monthGroup.groups.find((group) => group.slug === track.slug)
		if (!radioGroup) {
			radioGroup = {slug: track.slug, tracks: []}
			monthGroup.groups.push(radioGroup)
		}
		radioGroup.tracks.push(track)
	}

	return groups
}
