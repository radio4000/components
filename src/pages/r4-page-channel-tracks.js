import {html, LitElement} from 'lit'
import {until} from 'lit/directives/until.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import urlUtils from '../../src/libs/url-utils.js'
import R4SupabaseQuery from '../../src/components/r4-supabase-query.js'

const {getElementProperties, propertiesToSearch, propertiesFromSearch} = urlUtils

const notUrlProps = ['table']
const elementProperties = getElementProperties(R4SupabaseQuery).filter((prop) => notUrlProps.includes(prop))

export default class R4PageChannelTracks extends BaseChannel {
	static properties = {
		store: {type: Object, state: true},
		params: {type: Object, state: true},
		query: {type: Object, state: true},
		config: {type: Object, state: true},

		channel: {type: Object, reflect: true, state: true},

		/* this is set by the query result */
		tracks: {type: Array},
		filters: {type: Object},
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
				value: this.channel.slug,
			},
		]
	}

	get queryFilters() {
		return [...this.defaultFilters]
	}
	set queryFilters(filters) {
		return [...this.defaultFilters, ...filters]
	}

	async firstUpdated() {
		await this.init()
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const {data} = await sdk.channels.readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	init() {
		// a promise for the `until` directive
		if (this.config.singleChannel) {
			this.channel = this.findSelectedChannel(this.config.selectedSlug)
		} else {
			this.channel = this.findSelectedChannel(this.params.slug)
		}
	}

	async onQuery(event) {
		const {target, detail} = event

		/* update the query params */
		const urlSearch = propertiesToSearch(elementProperties, detail)
		const urlSearchString = `?${urlSearch.toString()}`
		/* window.history.replaceState(null, null, urlSearchString) */
		console.log('onQuery', detail, urlSearchString)

		/* get the data for this user query */
		const query = sdk.browse.query({
			page: detail.page,
			limit: detail.limit,
			table: detail.table,
			select: detail.select,
			orderBy: detail.orderBy,
			orderConfig: detail.orderConfig,
			filters: detail.filters,
		})

		return
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

	render() {
		return html`${until(
			Promise.resolve(this.channel)
				.then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				})
				.catch(() => this.renderNoPage()),
			this.renderLoading()
		)}`
	}

	renderPage(channel) {
		const query = html`
			<r4-supabase-query table="channel_track" .filters=${this.queryFilters} @query=${this.onQuery}></r4-supabase-query>
		`
		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${channel.slug}</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks'}>tracks</a>
				</nav-item>
			</nav>
			<main>
				<br />
				<r4-track-search slug=${channel.slug} href=${this.channelOrigin}></r4-track-search>
				${query} ${this.renderTracks()}
			</main>
		`
	}
	renderNoPage() {
		return html`404 - No channel with this slug`
	}
	renderLoading() {
		return html`<span>Loading channel tracks...</span>`
	}
	renderTracks() {
		if (this.tracks) {
			return html`
				<ul>
					${this.tracks.map(this.renderTrack)}
				</ul>
			`
		}
	}
	renderTrack(track) {
		console.log(track)
		return html`
			<li>
				<r4-track .track=${track}></r4-track>
			</li>
		`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}

	onNavigateList({detail}) {
		/* `page` here, is usually globaly the "router", beware */
		const {page: currentPage, limit, list} = detail
		const newPageURL = new URL(window.location)

		limit && newPageURL.searchParams.set('limit', limit)
		currentPage && newPageURL.searchParams.set('page', currentPage)

		if (window.location.href !== newPageURL.href) {
			page(newPageURL.pathname + newPageURL.search)
		}
	}
}
