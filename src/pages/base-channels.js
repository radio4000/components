import {html} from 'lit'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'
import debounce from 'lodash.debounce'

export default class BaseChannels extends R4Page {
	static properties = {
		channels: {type: Array, state: true},
		count: {type: Number},
		query: {type: Object, state: true},
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},
	}

	constructor() {
		super()
		// this.channels = []
		// this.query = {}
	}

	async connectedCallback() {
		super.connectedCallback()
		this.setQueryFromUrl()
	}

	setQueryFromUrl() {
		const {searchParams} = this
		const query = {
			table: 'channels',
			page: searchParams.get('page') || 1,
			limit: searchParams.get('limit') || 10,
			orderBy: searchParams.get('orderBy') || 'created_at',
			orderConfig: JSON.parse(searchParams.get('orderConfig')) || {ascending: false},
		}
		const filters = JSON.parse(searchParams.get('filters'))
		if (filters) query.filters = filters
		console.log('setting query from searchParams', this.query)
		this.setQuery(query)
		this.setChannels()
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	get searchFilter() {
		return this.query?.filters?.filter((filter) => {
			return filter?.column === 'fts'
		})[0]
	}

	setQuery(query) {
		urlUtils.updateSearchParams({...query}, ['table', 'select'])
		this.query = {...query}
		console.log('setQuery', this.query)
	}

	async setChannels() {
		const res = await browse(this.query)
		if (res.error) {
			console.log('error browsing channels')
			if (res.error.code === 'PGRST103') {
				// @todo "range not satisfiable" -> reset pagination
			}
		}
		console.log('setting channels', res)
		this.count = res.count
		this.channels = res.data
	}

	async onQuery(event) {
		event.preventDefault()
		this.setQuery(event.detail)
		await this.setChannels()
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
		await this.setChannels()
		// debounce(this.setChannels, 333, {trailing: true})
	}

	clearFilters() {
		this.setQuery({...this.query, filters: []})
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
						@input=${this.onSearchFilter}
						.filter=${this.searchFilter}
						placeholder="channels"
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
					page=${this.query?.page}
					limit=${this.query?.limit}
					order-by=${this.query?.orderBy}
					.orderConfig=${this.query?.orderConfig}
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
