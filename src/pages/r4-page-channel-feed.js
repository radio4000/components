import {LitElement, html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import {formatDate} from '../libs/date.js'

export default class R4PageChannelFeed extends LitElement {
	static properties = {
		limit: {type: Number, reflect: true},
		tracks: {type: Array, state: true},
	}

	constructor() {
		super()
		this.limit = 50
	}

	connectedCallback() {
		super.connectedCallback()
		this.loadTracks()
	}

	async loadTracks() {
		// Create string of slugs to query.
		const {id} = (await sdk.supabase.from('channels').select('id').eq('slug', this.params.slug).single()).data
		const following = (await sdk.channels.readFollowings(id)).data
		const orQuery = following.map((c) => `slug.eq.${c.slug}`).join(',')
		// Latest X tracks, newest first
		const res = await sdk.supabase
			.from('channel_tracks')
			.select('*')
			// .filter('slug', 'neq', 'oskar')
			// .filter('slug', 'neq', 'ko002')
			.or(orQuery)
			.order('created_at', {ascending: false})
			.limit(this.limit)
		this.tracks = res.data
	}

	render() {
		return html`
			<header>
				<nav>
					<nav-item><code>@</code><a href=${this.channelOrigin}>${this.params.slug}</a></nav-item>
					<nav-item><code>></code> feed</nav-item>
				</nav>
				<h1>Recent tracks from @${this.params.slug}'s favorite radios</h1>
			</header>

			${this.renderGroups()}
		`
	}

	renderGroups() {
		if (!this.tracks) return null
		const groups = groupTracks(this.tracks)
		return html`
			<ul list>
				${groups.map((g) => html`<li>${this.renderGroup(g)}</li>`)}
			</ul>
		`
	}

	renderGroup(group) {
		const {href} = this.config
		return html`
			<r4-channel-card slug=${group.slug} origin=${href + '/{{slug}}'}></r4-channel-card>
			<ul list>
				${repeat(
					group.tracks,
					(t) => t.id,
					(t) => html`
						<li>
							${formatDate(t.created_at)}
							<r4-button-play .track=${t} .tracks=${group.tracks}></r4-button-play>
							<r4-track .track=${t} href=${href} origin=${href + `/${t.slug}/tracks/`}></r4-track>
						</li>
					`
				)}
			</ul>
		`
	}

	createRenderRoot() {
		return this
	}
}

/**
 * Sorts and groups tracks by date and slug.
 * @param {Array} tracks
 * @returns {Array.<{slug: String, tracks: Array}>} groupedTracks
 */
function groupTracks(tracks) {
	const groupedTracks = []

	// Sort tracks by created, then slug in ascending order
	const sortedTracks = tracks.sort((a, b) => {
		if (a.created_at !== b.created_at) {
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		}
		return a.slug.localeCompare(b.slug)
	})

	// Create groups of tracks every time slug changes
	let currentGroup = {slug: null, tracks: []}
	for (const track of sortedTracks) {
		if (!currentGroup || track.slug !== currentGroup.slug) {
			currentGroup = {slug: track.slug, tracks: []}
			groupedTracks.push(currentGroup)
		}
		currentGroup.tracks.push(track)
	}

	return groupedTracks
}
