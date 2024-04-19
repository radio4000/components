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
				 <p><strong>Radio4000</strong>. Welcome. This is version two; went live on the 20th of April 2024, ten years later to the date.</p>
				 <blockquote>
				 <p>¿¡NOTICE!? For (technical) reasons we will all have to create new users. All radios are still here.<br>Once you have created a new user, you you can migrate your radio over here.</p>
				 </blockquote>
				<p><a href=${this.config.href + `/about`}>About &rarr;</a></p>
			</section>
		`
	}
}
