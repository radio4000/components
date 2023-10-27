import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {browse} from '../libs/browse.js'
// import {formatDate} from '../libs/date.js'
import page from 'page/page.mjs'
import debounce from 'lodash.debounce'

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		tracks: {type: Array, state: true},
		count: {type: Number},
		// query: {type: Object},
		query: {type: Object, state: true},
		searchQuery: {type: String, state: true},
		href: {type: String},
		origin: {type: String},
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},
	}

	async connectedCallback() {
		super.connectedCallback()
		const {data, error} = await sdk.channels.readChannel(this.slug)
		this.channel = data
		this.channelError = error
		this.setQueryFromUrl()
		await this.setTracks()
	}

	get defaultFilters() {
		return [{operator: 'eq', column: 'slug', value: this.slug}]
	}

	get queryWithDefaults() {
		const q = {...this.query}
		if (q.filters?.length) {
			q.filters = [...q.filters, ...this.defaultFilters]
		} else {
			q.filters = this.defaultFilters
		}
		return q
	}

	setQueryFromUrl() {
		const params = this.searchParams
		const query = {
			table: 'channel_tracks',
			page: params.get('page') || 1,
			limit: params.get('limit') || 10,
			orderBy: params.get('orderBy') || 'created_at',
			orderConfig: JSON.parse(params.get('orderConfig')) || {ascending: false},
		}
		const filters = JSON.parse(params.get('filters'))
		if (filters) query.filters = filters
		console.log('setting query from searchParams', query)
		this.setQuery(query)
	}

	get searchFilter() {
		return this.query?.filters?.filter(({column}) => {
			return column === 'fts'
		})[0]
	}

	async onQuery(event) {
		const query = event.detail
		console.log('onQuery', query)
		this.setQuery(query)
		await this.setTracks()
	}

	async onSearchFilter(event) {
		event.preventDefault()
		const {detail: filter} = event
		console.log('onSearchFilter', filter)
		if (filter) {
			this.setQuery({
				...this.query,
				filters: [filter],
			})
		} else {
			this.setQuery({
				...this.query,
				filters: [],
			})
		}
		await this.setTracks()
		// debounce(this.setTracks.bind(this), 333)
	}

	setQuery(query) {
		urlUtils.updateSearchParams(query, ['table', 'select'])
		const q = {...query}
		this.query = q
		console.log('setQuery', q)
	}

	async setTracks() {
		if (this.query) {
			const res = await browse(this.queryWithDefaults)
			if (res.error) {
				console.log('error browsing channels')
				if (res.error.code === 'PGRST103') {
					// @todo "range not satisfiable" -> reset pagination
				}
			}
			this.count = res.count
			this.tracks = res.data
			console.log('setting tracks', res)
		} else {
			this.count = 0
			this.tracks = []
			console.log('this happens??')
		}
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
			`,
		)
	}

	renderTracksQuery() {
		return html`
			<details open="true">
				<summary>Filters ${this.renderQueryFiltersSummary()}</summary>
				<r4-supabase-query
					table="channel_tracks"
					page=${this.query?.page}
					limit=${this.query?.limit}
					order-by=${this.query?.orderBy}
					.orderConfig=${this.query?.orderConfig}
					.filters=${this.query?.filters}
					count=${this.count}
					@query=${this.onQuery}
				></r4-supabase-query>
			</details>
		`
	}

	renderQueryFiltersSummary() {
		const filtersLen = this.query?.filters?.length
		return filtersLen ? html`<button @click=${this.clearFilters}>Clear ${filtersLen}</button>` : null
	}

	clearFilters() {
		this.setQuery({...this.query, filters: []})
	}

	renderTracksMenu() {
		if (!this.tracks) return null
		return html`
			<menu>
				<li><a href=${this.channelOrigin}>@${this.slug}</a></li>
				<li><r4-button-play .channel=${this.channel} label=" Play all"></r4-button-play></li>
				<li>
					<r4-supabase-filter-search
						placeholder="${this.count + ' tracks'}"
						.filter=${this.searchFilter}
						@input=${this.onSearchFilter}
					></r4-supabase-filter-search>
				</li>
				<li>
					<r4-button-play
						.tracks=${this.tracks}
						.channel=${this.channel}
						.filters=${this.filters}
						label="Play results"
						search=${this.searchQuery}
					></r4-button-play>
				</li>
			</menu>
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
	renderNoPage() {
		return html` <r4-page-main> 404 - No channel with this slug </r4-page-main> `
	}
}
