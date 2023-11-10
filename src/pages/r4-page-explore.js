import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import R4Page from '../components/r4-page.js'

export default class R4PageExplore extends R4Page {
	static properties = {
		config: {type: Object},
		query: {type: Object},
		channels: {type: Array},
	}

	constructor() {
		super()
		this.query = {table: 'channels'}
		this.channels = []
	}

	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}

	handleData(event) {
		console.log(event.detail)
		this.channels = event.detail.data
	}

	render() {
		return html`
			<h1>Explore</h1>
			<r4-base-query .initialQuery=${this.query} @data=${this.handleData}></r4-base-query>
			<r4-list>${this.renderListItems()}</r4-list>
		`
	}

	renderListItems() {
		if (!this.channels?.length) return html`No channels found.`
		return repeat(
			this.channels || [],
			(c) => c.id,
			(c) => html`
				<r4-list-item>
					<r4-channel-card .channel=${c} origin=${this.channelOrigin}></r4-channel-card>
				</r4-list-item>
			`,
		)
	}
}
