import {LitElement, html} from 'lit'
import debounce from 'lodash.debounce'
import urlUtils from '../libs/url-utils.js'
import {browse} from '../libs/browse.js'

// This is not in use anywhere.
// It is a sketch for later.

/**
 * @typedef {object} R4Query
 * @prop {string} [table] - table name
 * @prop {string} [select] - sql query to select columns
 * @prop {string} [search] - search query
 * @prop {R4Filter[]} [filters] - array of filters
 * @prop {string} [orderBy] - column name to order by
 * @prop {string} [order] - 'asc' or 'desc'
 * @prop {{ascending: boolean}} [orderConfig] - used internally to keep track of the order and respect foreign tables
 * @prop {number} [page] - page number
 * @prop {number} [limit] - items per page
 */

/**
 * @typedef {object} R4Filter
 * @prop {string} column - column name
 * @prop {string} operator - operator
 * @prop {string} value - value
 */

/**
 * Adds all the neccessary things to query the database with search, filters, ordering and pagination.
 */
export default class R4BaseQuery extends LitElement {
	static properties = {
		// pass these down
		initialQuery: {type: Object},
		defaultFilters: {type: Array},
		searchParams: {type: Object},
		// inside we have
		query: {type: Object, state: true},
		data: {type: Array, state: true},
		count: {type: Number, state: true},
	}

	constructor() {
		super()

		/** The amount of rows returned by fetchData */
		this.count = 0

		/** The latest data from fetchData */
		this.data = []

		/** @type {R4Query} */
		this.initialQuery = {}
		this.query = {}

		/** @type {R4Filter[]} */
		this.defaultFilters = []

		/** A debounced version of fetchData() */
		this.debouncedFetchData = debounce(() => this.fetchData(), 400, {leading: true, trailing: true})
	}

	connectedCallback() {
		// As soon as the DOM is ready, read the URL query params
		this.query = {...this.initialQuery, ...urlUtils.getQueryFromUrl(new URLSearchParams(location.search))}
		super.connectedCallback()
	}

	willUpdate(changedProperties) {
		// trigger an update if url params changed. to be watched
		if (changedProperties.has('searchParams')) {
			this.setQuery(urlUtils.getQueryFromUrl(new URLSearchParams(location.search)))
		}
	}

	/**
	 * Essentially this.query + this.defaultFilters
	 * This exists in order to apply query changes that won't appear in the UI.
	 * @returns {R4Query}
	 */
	get browseQuery() {
		const q = {...this.query}
		// Apply default filters if there are some.
		if (q.filters?.length) {
			q.filters = [...q.filters, ...this.defaultFilters]
		} else {
			q.filters = this.defaultFilters
		}
		// Apply search filter if there is a search query.
		if (this.query.search) {
			if (!q.filters) q.filters = []
			q.filters = [...q.filters, urlUtils.createSearchFilter(this.query.search)]
		}
		return q
	}

	async fetchData() {
		const res = await browse(this.browseQuery)

		// reset pagination while searching?
		if (res.error?.code === 'PGRST103') {
			this.setQuery({page: 1, limit: 10})
		}

		this.count = res.count
		this.data = res.data
		this.dispatchEvent(new CustomEvent('data', {detail: res}))
	}

	onQuery(event) {
		event.preventDefault()
		this.setQuery(event.detail)
	}

	onSearch(event) {
		event.preventDefault()
		const {search} = event.detail
		this.setQuery({search})
	}

	clearFilters() {
		this.setQuery({...this.query, filters: []})
	}

	// Just a shortcut when no extra logic is needed. Also updates URL params and reloads data.
	setQuery(query) {
		this.query = {...this.query, ...query}
		urlUtils.setSearchParams(this.query)
		this.debouncedFetchData()
	}

	render() {
		return html`${this.renderControls()}`
	}

	renderControls() {
		const filtersLen = this.query?.filters?.length
		return html`
			<menu>
				<li>
					<r4-supabase-filter-search
						search=${this.query?.search}
						placeholder=${this.count + ' rows'}
						@input=${this.onSearch}
					></r4-supabase-filter-search>
				</li>
			</menu>
			<details>
				<summary>
					Filters ${filtersLen ? html`<button @click=${this.clearFilters}>Clear ${filtersLen}</button>` : null}
				</summary>
				<r4-supabase-query
					table=${this.query?.table}
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

	createRenderRoot() {
		return this
	}
}
