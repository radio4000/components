import {html} from 'lit'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'
import page from 'page/page.mjs'
import debounce from 'lodash.debounce'

export default class BaseChannels extends R4Page {
	static properties = {
		config: {type: Object},
		searchParams: {type: Object, state: true},
		channels: {type: Array, state: true},
		count: {type: Number},
		query: {type: Object, state: true},
	}

	constructor() {
		super()
		this.channels = []
		/* this.query = {} */
	}
	async connectedCallback() {
		super.connectedCallback()
		let filters
		try {
			filters = JSON.parse(this.searchParams.get('filters'))
		} catch (e) {
			filters = []
		}

		this.query = {
			page: this.searchParams.get('page'),
			limit: this.searchParams.get('limit'),
			orderBy: this.searchParams.get('orderBy'),
			orderConfig: this.searchParams.get('orderConfig'),
			filters,
		}
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
	}

	async setChannels() {
		if (this.query) {
			const res = await browse(this.query)
			this.count = res.count
			this.channels = res.data
		}
	}

	async onQuery(event) {
		event.preventDefault()
		this.setQuery(event.detail)
		await this.setChannels()
	}

	onFilter(event) {
		event.preventDefault()
		const {detail: filter} = event
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
		debounce(this.setChannels, 333)
	}

	renderHeader() {
		return [this.renderMenu(), this.renderQuery()]
	}
	renderQueryFiltersSummary() {
		const filtersLen = this.query?.filters?.length
		if (filtersLen) {
			return html`(<a href=${this.config.href + '/explore'}>clear ${filtersLen}</a>)`
		}
	}
	renderMenu() {
		return html`
			<menu>
				<li>
					<r4-supabase-filter-search
						@input=${this.onFilter}
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
					page=${this.query?.page}
					limit=${this.query?.limit}
					order-by=${this.query?.orderBy}
					order-config=${this.query?.orderConfig}
					.filters=${this.query?.filters}
					@query=${this.onQuery}
					count=${this.count}
				></r4-supabase-query>
			</details>
		`
	}
	renderMain() {
		// use this.channels
		return html``
	}
}
