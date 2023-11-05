import {html} from 'lit'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'
import debounce from 'lodash.debounce'

export default class BaseChannels extends R4Page {
	static properties = {
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},

		channels: {type: Array, state: true},
		query: {type: Object, state: true},
		count: {type: Number},
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	get defaultFilters() {
		return []
	}

	// Here you can add modify the query before it is passed to browse().
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

	constructor() {
		super()
		this.debouncedSetChannels = debounce(() => this.setChannels(), 400, {leading: true, trailing: true})
	}

	connectedCallback() {
		// Collect relevant params from the URLSearchParams.
		this.query = urlUtils.getQueryFromUrl(this.searchParams)
		console.log('BaseChannels:initial query', this.query)
		super.connectedCallback()
	}

	async setChannels() {
		const res = await browse(this.queryWithDefaults)
		if (res.error) {
			console.log('error browsing channels')
			// @todo "range not satisfiable" -> reset pagination
			// if (res.error.code === 'PGRST103') {}
		}
		this.count = res.count
		this.channels = res.data
	}

	onQuery(event) {
		event.preventDefault()
		console.log('caught @onQuery -> setChannels & setSearchParams', this.query, event.detail)
		this.query = event.detail
		urlUtils.setSearchParams({...event.detail}, ['table', 'select'])
		this.debouncedSetChannels()
	}

	onSearchFilter(event) {
		event.preventDefault()
		const {search} = event.detail
		this.query.search = search
		urlUtils.setSearchParams({search}, ['page', 'limit', 'order', 'orderBy'])
		this.debouncedSetChannels()
	}

	clearFilters() {
		this.query.filters = []
		urlUtils.setSearchParams(this.query)
		this.debouncedSetChannels()
	}

	renderHeader() {
		return [this.renderMenu(), this.renderQuery()]
	}

	renderQueryFiltersSummary() {
		const filtersLen = this.query?.filters?.length
		return filtersLen ? html`<button @click=${this.clearFilters}>Clear ${filtersLen}</button>` : null
	}

	renderMenu() {
		return html`
			<menu>
				<li>
					<r4-supabase-filter-search
						search=${this.query?.search}
						placeholder="channels"
						@input=${this.onSearchFilter}
					></r4-supabase-filter-search>
				</li>
				<li>${this.count === 0 ? 0 : this.count || '…'} radio channels</li>
			</menu>
		`
	}

	renderQuery() {
		return html`
			<details>
				<summary>Filters ${this.renderQueryFiltersSummary()}</summary>
				<r4-supabase-query
					table="channels"
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

	renderMain() {
		// use this.channels
		return html``
	}
}
