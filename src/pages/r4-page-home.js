import {LitElement, html} from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	render() {
		const {href} = this.config
		const {user, userChannels, following} = this.store
		return html`
			<r4-page-header>
				<h1>Radio4000 beta</h1>
			</r4-page-header>
			<r4-page-main>
				<p>
					This is page is the public beta for a new Radio4000 (<a href=${href + `/about`}>learn more</a>). Try it out!
				</p>
				<p>
					<strong>WARNING &rarr;</strong> all data created on the beta website will be deleted regularely. Keep adding
					your music on the regular application!
				</p>
				${user ? this.renderMenuUser() : null} ${userChannels?.length ? this.renderUserChannels() : null}
				${following?.length ? this.renderFollowingChannels() : null}
			</r4-page-main>
		`
	}
	renderUserChannels() {
		const {userChannels} = this.store
		return html`
			<section>
				<h2>Your channel${userChannels?.length > 1 ? 's' : ''}</h2>
				<r4-list> ${userChannels.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}
	renderFollowingChannels() {
		const {following} = this.store
		return html`
			<section>
				<h2>Following</h2>
				<r4-list> ${following?.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderChannelCard(channel) {
		const channelOrigin = `${this.config.href}/${channel.slug}`
		return html` <r4-list-item>
			<r4-channel-card .channel=${channel} origin=${channelOrigin}></r4-channel-card>
		</r4-list-item>`
	}

	renderMenuUser() {
		return html``
	}

	createRenderRoot() {
		return this
	}
}
