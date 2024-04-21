import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageHome extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	renderHeader() {
		return this.store.user ? this.renderIn() : this.renderOut()
	}
	renderMain() {
		return html`
			${this.store.userChannels?.length ? this.renderUserChannels() : this.renderCreateChannel()}
			${this.store.following?.length ? this.renderFollowingChannels() : null}
		`
	}
	renderIn() {}
	renderOut() {
		return this.renderBetaNote()
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
	renderCreateChannel() {
		return html`
				<p><a href="${this.config.href}/new">Create radio</a></p>
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
				<p>Welcome to <r4-title></r4-title> version 2 (beta).</p>

				<blockquote>
					<p>
						¿¡NOTICE!? For (technical) reasons we will all have to create new users. All radios are still here.<br />Once
						you have created a new user, you can migrate your radio here.
					</p>
					<p>
						It's a bit of hassle (not really, a few clicks), and it's worth it. Once you've moved your radio, it'll
						appear on /explore again as usual.
					</p>
				</blockquote>
				<p><a href=${this.config.href + `/about`}>About &rarr;</a></p>
			</section>
		`
	}
}
