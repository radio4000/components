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
		this.debouncedFetchData = debounce(() => this.fetchData(), 400, {leading: true, trailing: true})

		/** The amount of rows returned by fetchData */
		this.count = 0

		/** The latest data from fetchData */
		this.data = []
	}

	connectedCallback() {
		super.connectedCallback()
		const queryFromUrl = urlUtils.getQueryFromUrl()
		const hasUrlQuery = Boolean(Object.keys(queryFromUrl).length)
		// console.log('connected fetched', this.initialQuery, {hasUrlQuery})
		// if (this.initialQuery && !hasUrlQuery) {
		this.setQuery(this.initialQuery)
		// }
	}

	willUpdate(changedProperties) {
		/* If the search params changed, as they do when you navigate, we want to update the query object with the new values. However, this also triggers on first load, causing an uneccesary fetchData call. */
		if (changedProperties.has('searchParams')) {
			const urlQuery = urlUtils.getQueryFromUrl()
			const a = JSON.stringify(this.query)
			const b = JSON.stringify(urlQuery)
			// console.log('willUpdate', a, b)
			if (a !== b) {
				// console.log('willUpdate search params triggered query update')
				this.setQuery(urlQuery)
			}
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
		this.query = {...this.query, ...query}
		this.debouncedFetchData()
		urlUtils.setSearchParams(this.query)
	}

	onQuery(event) {
		event.preventDefault()
		this.setQuery(event.detail)
	}

	onSearch(event) {
		event.preventDefault()
		this.setQuery({search: event.detail.search})
	}

	onFilters(event) {
		event.preventDefault()
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
