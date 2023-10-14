import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {query} from '../libs/browse.js'
// import {formatDate} from '../libs/date.js'
import page from 'page/page.mjs'

if (!window.r4sdk) window.r4sdk = sdk

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		count: {type: Number, state: true},
		lastQuery: {type: Object},
		searchQuery: {type: String, state: true},
		href: {type: String},
		origin: {type: String},
		// + props from BaseChannel
	}

	constructor() {
		super()
		this.tracks = []
		this.channel = null
		this.lastQuery = {}
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

	render() {
		if (this.channelError) return this.renderNoPage()
		return html`
			<r4-page-header> ${this.renderTracksMenu()} </r4-page-header>
			<r4-page-main>${this.channel ? [this.renderTracksQuery(), this.renderTracksList()] : null}</r4-page-main>
		`
	}

	renderTracksQuery() {
		const params = this.searchParams
		return html`
			<section>
				<details open="true">
					<summary>Filters ${this.renderQueryFiltersSummary()}</summary>
					<r4-supabase-query
						table="channel_tracks"
						count=${this.count}
						page=${params.get('page') || 1}
						limit=${params.get('limit') || 50}
						order-by=${params.get('order-by') || 'created_at'}
						order-config=${params.get('order-config') || JSON.stringify({ascending: false})}
						filters=${params.get('filters')}
						@query=${this.onQuery}
					></r4-supabase-query>
				</details>
			</section>
		`
	}
	renderQueryFiltersSummary() {
		const filtersLen = this.lastQuery?.filters?.length
		if (filtersLen) {
			return html`(<a href=${this.tracksOrigin}>clear ${filtersLen}</a>)`
		}
	}

	renderTracksMenu() {
		if (!this.tracks) return null

		let filter = JSON.stringify({column: 'tags', operator: 'neq', value: '{}'})
		const tagsHref = `${this.tracksOrigin}?filters=[${filter}]`
		filter = JSON.stringify({column: 'tags', operator: 'contains', value: 'jazz'})
		const jazzTagHref = `${this.tracksOrigin}?filters=[${filter}]`
		filter = JSON.stringify({column: 'mentions', operator: 'neq', value: '{}'})
		const mentionsHref = `${this.tracksOrigin}?filters=[${filter}]`

		return html`
			<menu>
				<li><a href=${this.channelOrigin}>${this.params.slug}</a></li>
				<li><r4-button-play .channel=${this.channel} label=" Play all"></r4-button-play></li>
				<li>
					<form>
						<label>Search <input placeholder="tracks" type="search" @input=${this.onSearch.bind(this)} /></label>
					</form>
				</li>
				<li>${this.renderTracksCount()}</li>
				<li>
					<r4-button-play .tracks=${this.tracks} .channel=${this.channel} label=" Play results"></r4-button-play>
				</li>
				<li><a href=${mentionsHref} label>@Mentions</a></li>
				<li><a href=${tagsHref} label>#Tags</a></li>
				<li><a href=${jazzTagHref} label>#jazz</a></li>
			</menu>
		`
	}
	renderTracksCount() {
		const filters = params.get('filters')
		if (this.lastQuery.filters) {
			return html`${this.count} tracks`
		}
	}

	async onSearch(event) {
		event.preventDefault()
		this.searchQuery = event.target.value
		if (!this.searchQuery) {
			page(this.tracksOrigin.replace(this.config.href, ''))
			return
		}
		if (this.searchQuery.length < 2) return
		const filter = {column: 'fts', operator: 'textSearch', value: `'${this.searchQuery}':*`}
		const url = `?filters=[${JSON.stringify(filter)}]`
		page(this.tracksOrigin.replace(this.config.href, '') + url)
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
		return html` <r4-list> ${this.renderListItems()} </r4-list> `
	}
	renderListItems() {
		return repeat(
			this.tracks,
			(t) => t.id,
			(t) => html`
				<r4-list-item>
					<r4-track
						.channel=${this.channel}
						.track=${t}
						.config=${this.config}
						href=${this.config.href}
						origin=${'' || this.tracksOrigin}
						.canEdit="${this.canEdit}1"
					></r4-track>
				</r4-list-item>
			`
		)
	}

	renderNoPage() {
		return html` <r4-page-main> 404 - No channel with this slug </r4-page-main> `
	}

	createRenderRoot() {
		return this
	}
}
