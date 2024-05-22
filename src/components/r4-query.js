import {LitElement, html} from 'lit'
import debounce from 'lodash.debounce'
import urlUtils from '../libs/url-utils.js'
import {browse} from '../libs/browse.js'

/**
 * @typedef {object} R4QueryObject
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

/** Adds all the neccessary things to query the database with search, filters, ordering and pagination. Builds upon <r4-supabase-query> and <r4-supabase-filter>.
 * @fires data - after any data is fetched
 */
export default class R4Query extends LitElement {
	static properties = {
		// public aka pass these down
		initialQuery: {type: Object},
		/** The default filters are not visible to the user */
		defaultFilters: {type: Array},
		searchParams: {type: Object},
		// private e.g. don't set these from the outside
		query: {type: Object, state: true},
		count: {type: Number, state: true},
		data: {type: Array, state: true},
	}

	constructor() {
		super()

		/** @type {R4QueryObject} */
		this.initialQuery = {}

		/** @type {R4Filter[]} */
		this.defaultFilters = []

		/** @type {R4QueryObject} */
		this.query = {}

		/** A debounced version of fetchData() */
		this.debouncedFetchData = debounce(() => this.fetchData(), 400, {leading: false, trailing: true})

		/** The amount of rows returned by fetchData */
		this.count = 0

		/** The latest data from fetchData */
		this.data = []
	}

	connectedCallback() {
		super.connectedCallback()
		// As soon as the DOM is ready, read the URL query params
		const queryFromUrl = urlUtils.getQueryFromUrl()
		if (this.initialQuery) {
			this.setQuery(Object.assign(this.initialQuery, queryFromUrl))
		} else {
			this.setQuery(queryFromUrl)
		}
	}

	willUpdate(changedProperties) {
		// trigger an update if url params changed. to be watched
		if (changedProperties.has('searchParams')) {
			console.log('willUpdate has searchParams')
			this.setQuery(urlUtils.getQueryFromUrl())
		}
	}

	/**
	 * Combines the initial query with the query from the URL.
	 * This exists in order to apply query changes that won't appear in the UI/search params.
	 * @returns {R4QueryObject}
	 */
	get finalQuery() {
		const q = {...this.initialQuery, ...this.query, ...urlUtils.getQueryFromUrl()}

		// Apply default filters if there are some.
		if (q.filters?.length) {
			q.filters = [...q.filters, ...this.defaultFilters]
		} else {
			q.filters = this.defaultFilters
		}

		// Translate any search query into a proper "search filter" syntax"
		if (this.query.search) {
			if (!q.filters) q.filters = []
			q.filters = [...q.filters, urlUtils.createSearchFilter(this.query.search)]
		}

		return q
	}

	async fetchData() {
		console.log('fetchData', this.finalQuery)
		const res = await browse(this.finalQuery)
		// reset pagination while searching?
		if (res.error?.code === 'PGRST103') {
			this.setQuery({page: 1, limit: 10})
		}
		this.count = res.count
		this.data = res.data
		this.dispatchEvent(new CustomEvent('data', {detail: res}))
	}

	/**
	 * Sets the query, updates the URL params and fetches data.
	 * @param {R4QueryObject} query
	 */
	setQuery(query) {
		console.log('setQuery', query, {previousQuery: this.query})
		this.query = {...this.query, ...query}
		this.debouncedFetchData()
		// Triggers a second update warning?
		urlUtils.setSearchParams(this.query)
	}

	onQuery(event) {
		event.preventDefault()
		console.log('onQuery', event.detail)
		this.setQuery(event.detail)
	}

	onSearch(event) {
		event.preventDefault()
		console.log('onSearch', event.detail)
		this.setQuery({search: event.detail.search})
	}

	onFilters(event) {
		event.preventDefault()
		console.log('onFilters', event.detail)
		if (event.detail) {
			this.setQuery({filters: event.detail})
		}
	}

	render() {
		// return html`<pre>
  //   initial query: ${JSON.stringify(this.initialQuery)}
  //   default filters: ${JSON.stringify(this.defaultFilters)}
  //   query: ${JSON.stringify(this.query)}
  //   final query: ${JSON.stringify(this.finalQuery)}
  //   </pre
		// 	>`
		return html`
			<r4-supabase-filter-search
				value=${this.finalQuery?.search}
				placeholder=${this.count + ' rows'}
				@input=${this.onSearch}
			></r4-supabase-filter-search>

			<r4-supabase-filters
				table=${this.finalQuery.table}
				.filters=${this.query.filters}
				@input=${this.onFilters}
			></r4-supabase-filters>

			<r4-supabase-query
				table=${this.finalQuery.table}
				order-by=${this.finalQuery.orderBy}
				order=${this.finalQuery.order}
				search=${this.finalQuery.search}
				page=${this.finalQuery.page}
				limit=${this.finalQuery.limit}
				count=${this.count}
				.filters=${this.query.filters}
				@query=${this.onQuery}
			></r4-supabase-query>
		`
	}

	createRenderRoot() {
		return this
	}
}
