import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageHome extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	renderHeader() {
		return this.renderBetaNote()
	}
	renderMain() {
		return html`
			${this.store.userChannels?.length ? this.renderUserChannels() : null}
			${this.store.following?.length ? this.renderFollowingChannels() : null}
		`
	}
	renderUserChannels() {
		const {userChannels} = this.store
		return html`
			<section>
				<h2>Channel${userChannels?.length > 1 ? 's' : ''}</h2>
				<r4-list> ${userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}
	renderFollowingChannels() {
		const {following} = this.store
		return html`
			<section>
				<h2>Network</h2>
				<r4-list> ${following?.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderChannelCard(channel, origin) {
		return html` <r4-list-item>
			<r4-channel-card .channel=${channel} origin="${origin}/${channel.slug}"></r4-channel-card>
		</r4-list-item>`
	}
	renderBetaNote() {
		return html`
			<section>
				<details open="true">
					<summary>This is a beta version!</summary>
					<p>
						This web app <a href=${this.config.href}>${this.config.client}</a> is a public demo of the new
						<r4-title></r4-title> beta version. Try it out now or see the
						<a href=${this.config.href + `/about`}>about</a> page.
					</p>
					<p>
						<strong>¿¡WARNING!?</strong> All data created on the beta website will be deleted regularely (PS: it's full
						of bugs and missing features D: !).
					</p>
					<p>Keep adding new tracks in the <a href="https://radio4000.com/" target="_blank">classic application</a>, until we make the switch.</p>
				</details>
			</section>
		`
	}
}
