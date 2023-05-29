import {html, LitElement} from 'lit'
import {until} from 'lit/directives/until.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import urlUtils from '../../src/libs/url-utils.js'
import R4SupabaseQuery from '../../src/components/r4-supabase-query.js'

const {getElementProperties, propertiesToSearch, propertiesFromSearch} = urlUtils

const notUrlProps = ['table']
const elementProperties = getElementProperties(R4SupabaseQuery).filter((prop) => !notUrlProps.includes(prop))

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		/* route props */
		store: {type: Object, state: true},
		params: {type: Object, state: true},
		query: {type: Object, state: true},
		config: {type: Object, state: true},

		/* state */
		channel: {type: Object, reflect: true, state: true},
		tracks: {type: Array, state: true},

		/* supabase query */
		table: {type: String},
		filters: {type: Object, state: true},
	}
	constructor() {
		super()
		this.tracks = []
		this.channel = null
		this.table = 'channel_track'
		this.filters = []
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/'
		}
	}

	get defaultFilters() {
		return [
			{
				operator: 'eq',
				column: 'channel_id.slug',
				value: this.channel?.slug,
			},
		]
	}

	async connectedCallback() {
		super.connectedCallback()
		this.init()
	}

	async init() {
		// a promise for the `until` directive
		if (!this.config.singleChannel) {
			this.channel = await this.findSelectedChannel(this.params.slug)
		} else {
			this.channel = await this.findSelectedChannel(this.config.selectedSlug)
		}
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const {data} = await sdk.channels.readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	async onQuery(event) {
		const {target, detail} = event

		if (!this.channel) return

		/* update the query params */
		const searchParams = propertiesToSearch(elementProperties, detail)
		const searchParamsString = `?${searchParams.toString()}`
		window.history.replaceState(null, null, searchParamsString)
		console.log('onQuery', searchParamsString)

		/* get the data for this user query */
		const query = sdk.browse.query({
			table: detail.table,
			select: detail.select,
			page: detail.page,
			limit: detail.limit,
			orderBy: detail.orderBy,
			orderConfig: detail.orderConfig,
			filters: [this.defaultFilters, ...this.filters],
		})

		const res = await query
		const {data, error} = res

		/* joint table embeded `track` as `track_id` ressource */
		if (data) {
			this.tracks = data.map(({track_id}) => track_id)
		}

		if (error) {
			console.log('Error querying data', error, detail)
		}
	}

	onFilters({detail}) {
		/* this.filters = [...this.filters, ...detail.filters] */
	}

	render() {
		return this.channel ? this.renderPage() : this.renderNoPage()
	}

	renderPage() {
		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${this.channel.slug}</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks'}>tracks</a>
				</nav-item>
			</nav>
			<main>
				<r4-track-search slug=${this.channel.slug} href=${this.channelOrigin}></r4-track-search>
				${[this.renderQuery(), this.renderTracks()]}
			</main>
		`
	}
	renderQuery() {
		return html`
			<details open>
				<summary>Tracks query filters</summary>
				<r4-supabase-query table=${this.table} @query=${this.onQuery}></r4-supabase-query>
				<r4-supabase-filters
					table=${this.table}
					.filters=${this.filters}
					@submit=${this.onFilters}
				></r4-supabase-filters>
			</details>
		`
	}
	renderTracks() {
		if (this.tracks) {
			return html`
				<ul>
					${this.tracks.map((t) => this.renderTrack(t))}
				</ul>
			`
		}
	}
	renderTrack(track) {
		return html` <li><r4-track .track=${track} origin=${'' || this.tracksOrigin}></r4-track></li> `
	}

	renderNoPage() {
		return html`404 - No channel with this slug`
	}
	renderLoading() {
		return html`<span>Loading channel tracks...</span>`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
