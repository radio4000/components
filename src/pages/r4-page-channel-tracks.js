import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../../src/libs/url-utils.js'
import R4SupabaseQuery from '../../src/components/r4-supabase-query.js'

const {getElementProperties, propertiesToSearch} = urlUtils

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

	async connectedCallback() {
		super.connectedCallback()
		console.log('tracks page connected', this.query)
		if (!this.config.singleChannel) {
			this.channel = await this.findSelectedChannel(this.params.slug)
		} else {
			this.channel = await this.findSelectedChannel(this.config.selectedSlug)
		}

		/* set initial user query from URL params */
		/* const props = propertiesFromSearch(elementProperties).filter(({name}) => !notUrlProps.includes(name))
			 props.forEach((prop) => {
			 if (prop.value) {
			 this[prop.name] = prop.value
			 }
			 }) */
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const {data} = await sdk.channels.readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	async onQuery(event) {
		if (!this.channel) return
		const {detail} = event
		console.log(`onQuery`, detail)
		const userQuery = {
			...detail,
			filters: [...this.defaultFilters, ...detail.filters],
		}
		this.browseTracks(userQuery)
		this.updateSearchParams(elementProperties, detail)
	}

	/* get the data for this user query */
	async browseTracks(userQuery) {
		console.log('browsing tracks', userQuery)
		const {data, error} = await sdk.browse.query(userQuery)
		/* joint table embeded `track` as `track_id` ressource */
		if (error) {
			console.log('Error browsing tracks', error)
		}
		if (data) {
			this.tracks = data.map(({track_id}) => track_id)
		} else {
			this.tracks = []
		}
	}

	// Update the URL query params
	updateSearchParams(elementProperties, detail) {
		const props = elementProperties.filter(({name}) => !notUrlProps.includes(name))
		const searchParams = propertiesToSearch(props, detail)
		const searchParamsString = `?${searchParams.toString()}`
		window.history.replaceState(null, null, searchParamsString)
		console.log('updateSeachParams', searchParamsString)
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
