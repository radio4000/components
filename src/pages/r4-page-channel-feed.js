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
		this.limit = 200
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
			// .lt('created_at', '2023-03-01')
			// .filter('slug', 'neq', 'ko002')
			.or(orQuery)
			.order('created_at', {ascending: false})
			.limit(this.limit)
		this.tracks = res.data
	}

	render() {
		const slug = this.params.slug
		const link = this.config.href + '/' + slug
		return html`
			<r4-page-header>
				<nav>
					<nav-item><code>@</code><a href=${link}>${slug}</a></nav-item>
					<nav-item>
						<code>/</code>
						<a href=${link + '/following'}>following</a>, <a href=${link + '/followers'}>followers</a> & feed
					</nav-item>
				</nav>
				<h1>Recent tracks from @${slug}'s favorite radios</h1>
			</r4-page-header>

			<r4-page-main> ${this.renderGroups()} </r4-page-main>
		`
	}

	renderGroups() {
		if (!this.tracks) return null
		const groups = groupTracks(this.tracks)
		console.log(groups)
		return html`
			<ul list>
				${groups.map((g) => html`<li>${this.renderMonth(g)}</li>`)}
			</ul>
		`
	}

	renderMonth(group) {
		const {href} = this.config
		return html`
			<h2>${group.month}</h2>
			<ul list>
				${repeat(
					group.groups,
					(x) => x.month,
					(x) => html`<li>${this.renderGroup(x)}</li>`
				)}
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
