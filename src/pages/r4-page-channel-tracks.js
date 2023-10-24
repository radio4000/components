import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {browse} from '../libs/browse.js'
// import {formatDate} from '../libs/date.js'
import page from 'page/page.mjs'

if (!window.r4sdk) window.r4sdk = sdk

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		count: {type: Number, state: true},
		query: {type: Object},
		searchQuery: {type: String, state: true},
		userFilters: {type: Object},
		href: {type: String},
		origin: {type: String},
		// + props from BaseChannel
	}
	get defaultFilters() {
		return [
			{
				operator: 'eq',
				column: 'slug',
				value: this.slug,
			},
		]
	}

	get filters() {
		return [...this.userFilters, ...this.defaultFilters]
	}

	get searchFilter() {
		return (
			this.query?.filters?.filter(({column}) => {
				return column === 'fts'
			})[0] || null
		)
	}
	async onQuery(event) {
		const userQuery = event.detail
		urlUtils.updateSearchParams(userQuery, ['table', 'select'])
		this.userFilters = userQuery.filters || []
		this.query = {...userQuery, filters: this.filters}
		const {count, data, error} = await browse(this.query)
		if (!error) {
			this.count = count
			this.tracks = data
		} else {
			this.count = 0
			this.tracks = []
		}
	}
	async onSearch(event) {
		event.preventDefault()
		const filter = event.detail
		this.searchQuery = event.target.search

		if (!filter) {
			page(this.tracksOrigin.replace(this.config.href, ''))
			return
		}
		if (this.searchQuery?.length < 2) {
			return
		}
		const url = `?filters=[${JSON.stringify(filter)}]`
		page(this.tracksOrigin.replace(this.config.href, '') + url)
	}
	constructor() {
		super()
		this.tracks = []
		this.channel = null
		this.query = {}
		this.userFilters = []
	}
	async connectedCallback() {
		super.connectedCallback()
		const {data, error} = await sdk.channels.readChannel(this.slug)
		this.channel = data
		this.channelError = error
	}

	renderHeader() {
		if (this.channelError) {
			return this.renderNoPage()
		} else {
			return [this.renderTracksMenu(), this.renderTracksQuery()]
		}
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
					<r4-list-item>No result for this query</r4-list-item>
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
						.canEdit="${this.canEdit}"
						href=${this.config.href}
						origin=${this.tracksOrigin}
					></r4-track>
				</r4-list-item>
			`
		)
	}

	renderTracksQuery() {
		const params = this.searchParams
		return html`
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
		`
	}
	renderQueryFiltersSummary() {
		const filtersLen = this.userFilters?.length
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
					<r4-supabase-filter-search
						@input=${this.onSearch}
						.filter=${this.searchFilter}
						placeholder="channel tracks"
					></r4-supabase-filter-search>
				</li>
				<li>${this.renderTracksCount()}</li>
				<li>
					<r4-button-play
						.tracks=${this.tracks}
						.channel=${this.channel}
						.filters=${this.filters}
						label="Play results"
						search=${this.searchQuery}
					></r4-button-play>
				</li>
				<li><a href=${mentionsHref} label>@Mentions</a></li>
				<li><a href=${tagsHref} label>#Tags</a></li>
				<li><a href=${jazzTagHref} label>#jazz</a></li>
			</menu>
		`
	}
	renderTracksCount() {
		if (this.query.filters) {
			return html`${this.count} tracks`
		}
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
	renderNoPage() {
		return html` <r4-page-main> 404 - No channel with this slug </r4-page-main> `
	}
}
