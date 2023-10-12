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
				<h1><r4-title></r4-title></h1>
				<p>
					The website <a href=${this.config.href}>${this.config.client}</a> is a public demo of the new
					<r4-title></r4-title> beta version. Try it out now or see the <a href=${href + `/about`}>about</a> page.
				</p>
				<p>
					<strong>WARNING &rarr;</strong> all data created on the beta website will be deleted regularely.
					<u>Keep adding new music in the classic application.</u>
				</p>
			</r4-page-header>
			<r4-page-main>
				${user ? this.renderMenuUser() : null} ${userChannels?.length ? this.renderUserChannels() : null}
				${following?.length ? this.renderFollowingChannels() : null}
			</r4-page-main>
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
				<h2>Following</h2>
				<r4-list> ${following?.map((channel) => this.renderChannelCard(channel, this.config.href))} </r4-list>
			</section>
		`
	}

	renderChannelCard(channel, origin) {
		return html` <r4-list-item>
			<r4-channel-card .channel=${channel} origin="${origin}/${channel.slug}"></r4-channel-card>
		</r4-list-item>`
	}

	renderMenuUser() {
		return html``
	}

	createRenderRoot() {
		return this
	}
}
