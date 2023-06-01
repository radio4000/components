import {html, LitElement} from 'lit'
import {until} from 'lit/directives/until.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import urlUtils from '../../src/libs/url-utils.js'
import R4SupabaseQuery from '../../src/components/r4-supabase-query.js'

const {getElementProperties, propertiesToSearch, propertiesFromSearch} = urlUtils

const notUrlProps = ['table', 'select']
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
	}
	constructor() {
		super()
		this.table = 'channel_track'
		this.tracks = []
		this.channel = null
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

	get slug() {
		return this.config.singleChannel ? this.config.selectedSlug : this.params.slug
	}

	async connectedCallback() {
		super.connectedCallback()
		const {data, error} = await sdk.channels.readChannel(this.slug)
		this.channel = data
		this.channelError = error
	}

	updateSearchParams(elementProperties, detail) {
		/* update the query params */
		const props = elementProperties.filter(({name}) => !notUrlProps.includes(name))
		const searchParams = propertiesToSearch(props, detail)
		const searchParamsString = `?${searchParams.toString()}`
		window.history.replaceState(null, null, searchParamsString)
		console.log('onQuery', searchParamsString)
	}

	/* get the data for this user query */
	async browseTracks(userQuery) {
		const {data, error} = await sdk.browse.query(userQuery)
		/* joint table embeded `track` as `track_id` ressource */
		if (data) {
			this.tracks = data.map(({track_id}) => track_id)
		} else {
			this.tracks = []
		}

		if (error) {
			console.log('Error querying data', error)
		}
	}

	async onQuery(event) {
		if (!this.channel) return
		const {target, detail} = event
		this.browseTracks({
			...detail,
			filters: [...this.defaultFilters, ...detail.filters],
		})
		this.updateSearchParams(elementProperties, detail)
	}

	render() {
		return [
			this.channel && !this.channelError ? this.renderPage() : this.renderLoading(),
			this.channelError ? this.renderNoPage() : null,
		]
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
				<r4-supabase-query
					@query=${this.onQuery}
					table=${this.table}
					page=${this.query.page || 1}
					order-by=${this.query['order-by']}
					order-config=${this.query['order-config']}
					filters=${this.query.filters || []}
				></r4-supabase-query>
			</details>
		`
	}
	renderTracks() {
		if (this.tracks) {
			return html`
				<r4-button-play .tracks=${this.tracks} .channel=${this.channel} label="Play selection"></r4-button-play>
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
