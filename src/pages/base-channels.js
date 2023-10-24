import {html} from 'lit'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'
import page from 'page/page.mjs'

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
		console.log('this.searchParams', this.searchParams)
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
		console.log('on query', event.detail)
		this.setQuery(event.detail)
		await this.setChannels()
	}

	async onFilter(event) {
		event.preventDefault()
		const {detail: filter} = event
		console.log('on filter', filter)
		if (filter) {
			this.setQuery({
				...this.query,
				filters: [filter],
			})
		}
		await this.setChannels()
	}

	renderHeader() {
		return html`
			<details open="true">
				<summary>Exploring ${this.count || '…'} radio channels.</summary>
				<r4-supabase-filter-search
					@input=${this.onFilter}
					.filter=${this.searchFilter}
					placeholder="channels"
				></r4-supabase-filter-search>
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
