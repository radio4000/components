import { html, LitElement } from 'lit'
import { query } from '../libs/browse'
import urlUtils from '../libs/url-utils'
import R4SupabaseQuery from '../components/r4-supabase-query'


export default class R4PageExplore extends LitElement {
	static properties = {
		/* props */
		config: { type: Object },
		query: { type: Object, state: true },

		channels: { type: Array, state: true },
	}
	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
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
					page=${this.query.page}
					limit=${this.query.limit}
					order-by=${this.query['order-by']}
					order-config=${this.query['order-config']}
					.filters=${this.query.filters}
					@query=${this.onQuery}
				></r4-supabase-query>
				<ul>
					${this.channels?.length ?
						this.channels.map(c => html`<li>${c.name} <r4-channel-card .channel=${c}></r4-channel-card></li>`) : ''}
				</ui>
			</main>
		`
	}

	async onQuery(event) {
		const q = event.detail
		this.channels = (await query(q)).data
		this.updateSearchParams(q)
	}

	updateSearchParams(detail) {
		const notUrlProps = ['table', 'select']
		const elementProperties = urlUtils.getElementProperties(R4SupabaseQuery).filter((prop) => !notUrlProps.includes(prop))
		const props = elementProperties.filter(({name}) => !notUrlProps.includes(name))
		const searchParams = urlUtils.propertiesToSearch(props, detail)
		const searchParamsString = `?${searchParams.toString()}`
		window.history.replaceState(null, null, searchParamsString)
	}

	createRenderRoot() {
		return this
	}
}
