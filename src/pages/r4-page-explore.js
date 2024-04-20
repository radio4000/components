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
				<h1>Explore</h1>
				<r4-query .initialQuery=${this.query} @data=${this.handleData}></r4-query>
			</r4-page-header>
			<r4-page-main>
				<section>
					<r4-list>${this.renderListItems()}</r4-list>
				</section>
				<p>
					Missing a radio? The radios you see above have all moved to the new Radio4000.<br />
					Other radios can still be browsed on <a href="https://v1.radio4000.com">v1</a>.
				</p>
			</r4-page-main>
			<r4-page-aside>
				<p>Where's my radio? There used to be thousands of radios, what happened?</p>
				<p>The radios you see above have all migrated to the new Radio4000. Find the rest via their URL (like radio4000.com/my-radio) or visit <a href="https://v1.radio4000.com">v1</a>. </p>
				<p>We encourage everyone to <a href="${this.config.href}/sign-up">create a new account</a> and migrate your radio. It'll immediately appear on Explore again and you have access to the new system and features.</p>
			</r4-page-aside>
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
