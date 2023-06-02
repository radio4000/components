import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'
import urlUtils from '../libs/url-utils.js'
import {query} from '../libs/browse.js'

if (!window.r4sdk) window.r4sdk = sdk

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
	}

	constructor() {
		super()
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
		const q = event.detail
		q.filters.push(...this.defaultFilters)
		this.tracks = (await query(q)).data
		urlUtils.updateSearchParams(q, ['table', 'select'])
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
				<summary>Query tracks</summary>
				<r4-supabase-query
					table="channel_tracks"
					page=${this.query.page}
					limit=${this.query.limit}
					order-by=${this.query['order-by']}
					order-config=${this.query['order-config']}
					.filters=${this.query.filters}
					@query=${this.onQuery}
				></r4-supabase-query>
			</details>
		`
	}
	renderTracks() {
		if (this.tracks) {
			return html`
				<r4-button-play .tracks=${this.tracks} .channel=${this.channel} label="Play selection"></r4-button-play>
				<ul>
					${repeat(this.tracks, (t) => t.id, (t) => this.renderTrack(t))}
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

	createRenderRoot() {
		return this
	}
}
