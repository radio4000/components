import {html, LitElement} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {query} from '../libs/browse'
import urlUtils from '../libs/url-utils'

export default class R4PageExplore extends LitElement {
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

	render() {
		return html`
			<header>
				<details>
					<summary>Filter ${this.count} channels</summary>
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
			</header>
			<main>
				<r4-list> ${this.renderListItems()} </r4-list>
			</main>
		`
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

	createRenderRoot() {
		return this
	}
}
