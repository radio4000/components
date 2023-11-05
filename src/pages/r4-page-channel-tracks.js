import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {browse} from '../libs/browse.js'
import debounce from 'lodash.debounce'

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},

		href: {type: String},
		origin: {type: String},
		tracks: {type: Array, state: true},
		query: {type: Object, state: true},
		count: {type: Number},
	}

	constructor() {
		super()
		this.debouncedSetTracks = debounce(() => this.setTracks(), 400, {leading: true, trailing: true})
	}

	get defaultFilters() {
		return [{operator: 'eq', column: 'slug', value: this.slug}]
	}

	// Here you can add modify the query before it is passed to browse()
	get queryWithDefaults() {
		const q = {...this.query}
		if (q.filters?.length) {
			q.filters = [...q.filters, ...this.defaultFilters]
		} else {
			q.filters = this.defaultFilters
		}
		if (this.query.search) {
			if (!q.filters) q.filters = []
			q.filters = [...q.filters, urlUtils.createSearchFilter(this.query.search)]
		}
		return q
	}

	async onQuery(event) {
		event.preventDefault()
		console.log('caught @onQuery -> setTracks + setSearchParams', event.detail)
		this.query = event.detail
		urlUtils.setSearchParams(event.detail, ['table', 'select'])
		this.debouncedSetTracks()
	}

	async onSearchFilter(event) {
		event.preventDefault()
		const {search} = event.detail
		this.query.search = search
		console.log('adding search param')
		urlUtils.setSearchParams({search}, ['page', 'limit', 'order', 'orderBy'])
		this.debouncedSetTracks()
	}

	async setTracks() {
		const res = await browse(this.queryWithDefaults)
		if (res.error) {
			console.log('error browsing tracks')
			if (res.error.code === 'PGRST103') {
				// @todo "range not satisfiable" -> reset pagination
				// if (res.error.code === 'PGRST103') {}
			}
		}
		this.count = res.count
		this.tracks = res.data
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
					.filters=${this.query?.filters}
					order-by=${this.query?.orderBy}
					order=${this.query?.order}
					search=${this.query?.search}
					page=${this.query?.page}
					limit=${this.query?.limit}
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
		this.query.filters = []
		this.debouncedSetTracks()
	}

	renderTracksMenu() {
		if (!this.tracks) return null
		return html`
			<menu>
				<li><a href=${this.channelOrigin}>@${this.slug}</a></li>
				<li><r4-button-play .channel=${this.channel} label=" Play all"></r4-button-play></li>
				<li>
					<r4-supabase-filter-search
						search=${this.query?.search}
						placeholder="${this.count + ' tracks'}"
						@input=${this.onSearchFilter}
					></r4-supabase-filter-search>
				</li>
				<li>
					<r4-button-play
						.tracks=${this.tracks}
						.channel=${this.channel}
						.filters=${this.filters}
						label="Play results"
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
