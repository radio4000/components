import {html} from 'lit'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'
// import debounce from 'lodash.debounce'

export default class BaseChannels extends R4Page {
	static properties = {
		// from router
		config: {type: Object},
		searchParams: {type: Object, state: true},

		channels: {type: Array, state: true},
		count: {type: Number},
		query: {type: Object, state: true},
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	get searchFilter() {
		return this.query?.filters?.filter((filter) => {
			return filter?.column === 'fts'
		})[0]
	}

	// Here you can add modify the query before it is passed to browse().
	get queryWithDefaults() {
		return {...this.query, table: 'channels'}
	}

	async connectedCallback() {
		this.setQueryFromUrl()
		super.connectedCallback()
	}

	// Collect relevant params from the URLSearchParams.
	setQueryFromUrl() {
		this.query = urlUtils.getQueryFromUrl(this.searchParams)
		console.log('setQueryFromUrl', this.query)
	}

	setQuery(query) {
		console.log('setQuery', query)
		this.query = query
	}

	async setChannels() {
		const res = await browse(this.queryWithDefaults)
		if (res.error) {
			console.log('error setting channels')
			// @todo "range not satisfiable" -> reset pagination
			// if (res.error.code === 'PGRST103') {}
		}
		this.count = res.count
		this.channels = res.data
	}

	async onQuery(event) {
		event.preventDefault()
		console.log('caught @onQuery -> setChannels & setSearchParams', this.query, event.detail)
		this.setQuery(event.detail)
		await this.setChannels()
		urlUtils.setSearchParams({...event.detail}, ['table', 'select'])
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
					order-by=${this.query?.orderBy}
					order=${this.query?.order}
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
