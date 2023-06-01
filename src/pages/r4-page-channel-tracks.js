import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import {getElementProperties, propertiesToSearch} from '../libs/url-utils.js'
import {query} from '../libs/browse.js'
import R4SupabaseQuery from '../components/r4-supabase-query.js'

if (!window.r4sdk) window.r4sdk = sdk

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
		/* use the view channel_tracks */
		this.table = 'channel_tracks'
		this.tracks = []
		this.channel = null
	}

	get defaultFilters() {
		return [
			{
				operator: 'eq',
				column: 'slug',
				value: this.channel?.slug,
			},
		]
	}

	async connectedCallback() {
		super.connectedCallback()
		const {data, error} = await sdk.channels.readChannel(this.slug)
		this.channel = data
		this.channelError = error
	}

	async onQuery(event) {
		if (!this.channel) return
		const userQuery = {...event.detail}
		userQuery.filters = [...this.defaultFilters, userQuery.filters]
		this.browseTracks(userQuery)
		this.updateSearchParams(elementProperties, event.detail)
	}

	/* get the data for this user query */
	async browseTracks(userQuery) {
		console.log('browsing tracks', userQuery.orderBy, userQuery.orderConfig)
		const {data, error} = await query(userQuery)
		console.log('got tracks', data)
		if (error) {
			console.log('Error browsing tracks', error)
		}
		if (data) {
			this.tracks = data
		} else {
			this.tracks = []
		}
	}

	// Update the URL query params
	updateSearchParams(elementProperties, detail) {
		const props = elementProperties.filter(({name}) => !notUrlProps.includes(name))
		const searchParams = propertiesToSearch(props, detail)
		const searchParamsString = `?${searchParams.toString()}`
		// console.log('updateSearchParams', searchParamsString)
		window.history.replaceState(null, null, searchParamsString)
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
					page=${this.query.page}
					limit=${this.query.limit}
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
