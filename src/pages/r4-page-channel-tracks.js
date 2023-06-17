import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {query} from '../libs/browse.js'

if (!window.r4sdk) window.r4sdk = sdk

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		display: {type: String, state: true},
		count: {type: Number, state: true},
		lastQuery: {type: Object},
		// + props from BaseChannel
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
		const res = await query(q)
		this.count = res.count
		this.tracks = res.data
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
			<header>
				<nav>
					<nav-item>
						<code>@</code><a href=${this.channelOrigin}>${this.channel.slug}</a>
					</nav-item>
					<nav-item>
						<code>/</code> <a href=${this.config.href + '/add'}>+Add</a>, Tracks & <a href=${this.channelOrigin + '/update'}>Update</a>
					</nav-item>
				</nav>
				<h1>${this.channel.name} tracks</h1>
			</header>
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
				<summary>Filter</summary>
				<r4-supabase-query
					table="channel_tracks"
					count=${this.count}
					page=${params.get('page') || 1}
					limit=${params.get('limit') || 10}
					order-by=${params.get('order-by') || 'created_at'}
					order-config=${params.get('order-config') || JSON.stringify({ascending: false})}
					filters=${params.get('filters')}
					@query=${this.onQuery}
				></r4-supabase-query>
			</details>
		`
	}

	renderTracks() {
		if (!this.tracks) return null

		let filter = JSON.stringify({column: 'tags', operator: 'neq', value: '{}'})
		const tagsHref = `${this.tracksOrigin}?filters=[${filter}]`
		filter = JSON.stringify({column: 'tags', operator: 'contains', value: 'jazz'})
		const jazzTagHref = `${this.tracksOrigin}?filters=[${filter}]`
		filter = JSON.stringify({column: 'mentions', operator: 'neq', value: '{}'})
		const mentionsHref = `${this.tracksOrigin}?filters=[${filter}]`

		return html`
			<p>Found ${this.count} tracks</p>
			<menu>
				<r4-button-play .tracks=${this.tracks} .channel=${this.channel} label="Play selection"></r4-button-play>
				<r4-button-play .channel=${this.channel} label="Play all"></r4-button-play>
				<a href=${mentionsHref} label>@Mentions</a>
				<a href=${tagsHref} label>#Tags</a>
				<a href=${jazzTagHref} label>#jazz</a>
				<form @change=${this.setDisplay}>
					<label><input type="radio" name="display" value="list" ?checked=${this.display === 'list'} /> List</label>
					<label><input type="radio" name="display" value="table" ?checked=${this.display === 'table'} /> Table</label>
				</form>
			</menu>

			${this.display === 'table' ? this.renderTracksTable() : this.renderTracksList()}
		`
	}

	renderTracksTable() {
		return html`
			<table>
				<thead>
					<th></th>
					<th>Track</th>
					<th>Description</th>
					<th>Tags</th>
					<th>Mentions</th>
					<th>Created</th>
				</thead>
				<tbody>
					${repeat(
						this.tracks,
						(t) => t.id,
						(t) => html`
							<tr>
								<td><r4-button-play .channel=${this.channel} .track=${t} .tracks=${this.tracks}></r4-button-play></td>
								<td><a href=${this.tracksOrigin + t.id}>${t.title}</a></td>
								<td>${t.description}</td>
								<td>${t.tags?.length ? t.tags.map((x) => this.renderTag(x)) : null}</td>
								<td>${t.mentions?.length ? t.mentions.map((x) => this.renderMention(x)) : null}</td>
								<td>${formatDate(t.created_at)}</td>
							</tr>
						`
					)}
				</tbody>
			</table>
		`
	}

	createTagUrl(tag) {
		const filter = JSON.stringify({column: 'tags', operator: 'contains', value: tag})
		return `${this.tracksOrigin}?filters=[${filter}]`
	}

	renderTag(tag) {
		return html`<a href=${this.createTagUrl(tag)} label>${tag}</a>`
	}

	renderMention(slug) {
		const url = this.config.href + '/' + slug
		return html`<a href="${url}" label>${slug}</a>`
	}

	renderTracksList() {
		return html`
			<ul list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => html`
						<li>
							<r4-button-play .channel=${this.channel} .track=${t} .tracks=${this.tracks}></r4-button-play>
							<r4-track .track=${t} href=${this.config.href} origin=${'' || this.tracksOrigin}></r4-track>
						</li>
					`
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
