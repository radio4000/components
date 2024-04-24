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
		this.channels = event.detail.data
	}

	render() {
		return html`
			<r4-page-header>
				<menu>
					<li>
						<h1>
							<a href="${this.config.href}/explore">Explore</a>
						</h1>
					</li>
					<li>
						<r4-query .initialQuery=${this.query} @data=${this.handleData}></r4-query>
					</li>
				</menu>
			</r4-page-header>
			<r4-page-main>
				<section>
					<r4-list>${this.renderListItems()}</r4-list>
				</section>
			</r4-page-main>
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
