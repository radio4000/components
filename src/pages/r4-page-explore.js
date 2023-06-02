import {html, LitElement} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {query} from '../libs/browse'
import urlUtils from '../libs/url-utils'

export default class R4PageExplore extends LitElement {
	static properties = {
		/* props */
		config: {type: Object},
		searchParams: {type: Object, state: true},
		channels: {type: Array, state: true},
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	async onQuery(event) {
		const q = event.detail
		this.channels = (await query(q)).data
		urlUtils.updateSearchParams(q, ['table', 'select'])
	}

	render() {
		return html`
			<header>
				<h1>Explore channels</h1>
				<menu>
					<li><a href=${`${this.config.href}/search`}>Search</a></li>
					<li><a href=${`${this.config.href}/map`}>Map</a></li>
				</menu>
			</header>
			<main>
				<r4-supabase-query
					table="channels"
					page=${this.searchParams.page}
					limit=${this.searchParams.limit}
					order-by=${this.searchParams['order-by']}
					order-config=${this.searchParams['order-config']}
					.filters=${this.searchParams.filters}
					@query=${this.onQuery}
				></r4-supabase-query>
				<ul>
					${repeat(
						this.channels || [],
						(c) => c.id,
						(c) =>
							html`<li>${c.name} <r4-channel-card .channel=${c} origin=${this.channelOrigin}></r4-channel-card></li>`
					)}
				</ul>
			</main>
		`
	}

	createRenderRoot() {
		return this
	}
}
