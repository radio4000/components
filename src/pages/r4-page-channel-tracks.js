import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {query} from '../libs/browse.js'

if (!window.r4sdk) window.r4sdk = sdk

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		/* route props */
		store: {type: Object, state: true},
		params: {type: Object, state: true},
		searchParams: {type: Object, state: true},
		config: {type: Object, state: true},
		/* state */
		channel: {type: Object, reflect: true, state: true},
		tracks: {type: Array, state: true},
		display: {type: String, state: true},
	}

	constructor() {
		super()
		this.tracks = []
		this.channel = null
		this.display = 'list'
	}

	get defaultFilters() {
		return [
			{
				operator: 'eq',
				column: 'slug',
				value: this.channel?.slug,
			},
		]
	}

	async connectedCallback() {
		super.connectedCallback()
		const {data, error} = await sdk.channels.readChannel(this.slug)
		this.channel = data
		this.channelError = error
	}

	async onQuery(event) {
		if (!this.channel) return
		const q = event.detail
		urlUtils.updateSearchParams(q, ['table', 'select'])
		const filtersWithDefaults = [...(q.filters || []), ...this.defaultFilters]
		q.filters = filtersWithDefaults
		this.tracks = (await query(q)).data
		this.lastQuery = q
	}

	setDisplay(event) {
		event.preventDefault()
		const fd = new FormData(event.currentTarget)
		this.display = fd.get('display')
	}

	render() {
		return [
			this.channel && !this.channelError ? this.renderPage() : this.renderLoading(),
			this.channelError ? this.renderNoPage() : null,
		]
	}

	renderPage() {
		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${this.channel.slug}</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks'}>tracks</a>
				</nav-item>
			</nav>
			<main>
				<r4-track-search slug=${this.channel.slug} href=${this.channelOrigin}></r4-track-search>
				${[this.renderQuery(), this.renderTracks()]}
			</main>
		`
	}

	renderQuery() {
		const params = this.searchParams
		return html`
			<details open>
				<summary>Query tracks</summary>
				<r4-supabase-query
					table="channel_tracks"
					page=${params.get('page')}
					limit=${params.get('limit')}
					order-by=${params.get('order-by')}
					order-config=${params.get('order-config')}
					filters=${params.get('filters')}
					@query=${this.onQuery}
				></r4-supabase-query>
			</details>
		`
	}

	renderTracks() {
		if (!this.tracks) return null

		return html`
			<menu>
				<r4-button-play .tracks=${this.tracks} .channel=${this.channel} label="Play selection"></r4-button-play>
				<r4-pagination
					page=${this.searchParams.get('page')}
					.lastQuery=${this.lastQuery}
					@query=${this.onQuery}
				></r4-pagination>
			</menu>

			<form @change=${this.setDisplay}>
				<label><input type="radio" name="display" value="list" ?checked=${this.display === 'list'} /> List</label>
				<label><input type="radio" name="display" value="table" ?checked=${this.display === 'table'} /> Table</label>
			</form>

			${this.display === 'table' ? this.renderTracksTable() : this.renderTracksList()}
		`
	}

	renderTracksTable() {
		return html`
			<table>
				<thead>
					<th>title</th>
					<th>description</th>
					<th>tags</th>
					<th>mentions</th>
					<th>created</th>
				</thead>
				<tbody>
					${repeat(
						this.tracks,
						(t) => t.id,
						(t) => html`
							<tr>
								<td><a href=${this.tracksOrigin + t.id}>${t.title}</a></td>
								<td>${t.description}</td>
								<td>${t.tags}</td>
								<td>${t.mentions}</td>
								<td>${formatDate(t.created_at)}</td>
							</tr>
						`
					)}
				</tbody>
			</table>
		`
	}

	renderTracksList() {
		return html`
			<ul>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => html` <li><r4-track .track=${t} origin=${'' || this.tracksOrigin}></r4-track></li> `
				)}
			</ul>
		`
	}

	renderNoPage() {
		return html`404 - No channel with this slug`
	}

	renderLoading() {
		return html`<span>Loading channel tracks...</span>`
	}

	createRenderRoot() {
		return this
	}
}

function formatDate(dateStr) {
	const date = new Date(dateStr)
	const formatter = new Intl.DateTimeFormat('de', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		// hour: 'numeric',
		// minute: 'numeric',
		// second: 'numeric',
		// timeZoneName: 'short',
	})
	const formattedDate = formatter.format(date)
	return formattedDate
}
