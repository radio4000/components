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
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	async onQuery(event) {
		const q = event.detail
		urlUtils.updateSearchParams(q, ['table', 'select'])
		const res = await query(q)
		this.count = res.count
		this.channels = res.data
		this.lastQuery = q
	}

	renderHeader() {
		return html`
			<p>Explore ${this.count || '…'} radio channels.</p>
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
