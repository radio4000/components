import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageHome extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	renderHeader() {
		if (!this.store.userChannels?.length) {
			return html`<a href=${this.config.href}><r4-favicon></r4-favicon></a>`
		}
	}
	renderMain() {
		return html`
			${this.store.userChannels?.length ? this.renderUserChannels() : this.renderBetaNote()}
			${this.store.following?.length ? this.renderFollowingChannels() : this.renderSignIn()}
		`
	}
	renderUserChannels() {
		const {userChannels} = this.store
		return html`
			<section>
				<header>
					<h2>Channel${userChannels?.length > 1 ? 's' : ''}</h2>
				</header>
				<r4-list> ${userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}
	renderSignIn() {
		return html`
			<p>
				<a href="${this.config.href}/sign/in">Sign in</a> a user account, to create, import or manage a radio 4000
				channel.
			</p>
		`
	}
	renderFollowingChannels() {
		const {following} = this.store
		return html`
			<section>
				<header>
					<h2>Network</h2>
				</header>
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
				<dialog open inline>
					<p>
						Welcome to the new <strong><r4-title></r4-title></strong>, version 2 (<strong>v2</strong>).
					</p>
					<p>
						To import a radio channel from v1 to v2, see
						<a href="${this.config.hrefMigrate}">migrate</a>.
					</p>
					<p>
						All previous radio channels are still available on the
						<a href="${this.config.hrefV1}">v1</a> website.
					</p>
					<p>We hope y'all enjoy, feedbacks' always welcome!</p>
				</dialog>
			</section>
		`
	}
}
