import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {query} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4Page from '../components/r4-page.js'

export default class R4PageExplore extends R4Page {
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
		const res = await query(this.query)
		this.count = res.count
		this.channels = res.data
	}

	renderHeader() {
		return html`
			<details open="true">
				<summary>Exploring ${this.count || '…'} radio channels.</summary>
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
		return html` <r4-list> ${this.renderListItems()} </r4-list> `
	}
	renderListItems() {
		return repeat(
			this.channels || [],
			(c) => c.id,
			(c) => html`
				<r4-list-item>
					<r4-channel-card .channel=${c} origin=${this.channelOrigin}></r4-channel-card>
				</r4-list-item>
			`
		)
	}
}
