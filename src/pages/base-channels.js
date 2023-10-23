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

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	async onQuery(event) {
		this.query = event.detail
		urlUtils.updateSearchParams(this.query, ['table', 'select'])
		this.filters = this.query.filters || []
		const res = await browse(this.query)
		this.count = res.count
		this.channels = res.data
	}

	async onSearch(event) {
		event.preventDefault()
		const filter = event.detail
		this.searchQuery = event.target.search

		if (!filter) {
			page(window.location.href.replace(this.config.href, ''))
			return
		}
		if (this.searchQuery?.length < 2) {
			return
		}
		const url = `?filters=[${JSON.stringify(filter)}]`
		page(window.location.href.replace(this.config.href, '') + url)
	}

	renderHeader() {
		return html`
			<details open="true">
				<summary>Exploring ${this.count || '…'} radio channels.</summary>
				<r4-supabase-filter-search
					@input=${this.onSearch}
					.filter=${this.searchFilter}
					placeholder="channels"
				></r4-supabase-filter-search>
				<r4-supabase-query
					table="channels"
					page=${this.searchParams.get('page')}
					limit=${this.searchParams.get('limit')}
					count=${this.count}
					order-by=${this.searchParams.get('order-by')}
					order-config=${this.searchParams.get('order-config')}
					filters=${this.searchParams.get('filters')}
					@query=${this.onQuery}
				></r4-supabase-query>
			</details>
		`
	}
	renderMain() {
		return html``
	}
}
