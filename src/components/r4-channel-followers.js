import {LitElement, html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'

export default class R4ChannelFollowers extends LitElement {
	static properties = {
		slug: {type: String, reflect: true},
		channels: {type: Array, state: true},
	}

	async query() {
		this.channels = (
			await sdk.supabase
				.from('followers')
				.select('*, channel_id!inner(slug), follower_id(*)')
				.eq('channel_id.slug', this.slug)
		).data
	}

	render() {
		const {channel} = this
		if (this.slug && !this.channels) this.query()
		return html`
			<ul list>
				${repeat(
					this.channels || [],
					(c) => c.id,
					(c) =>
						html`<li>
							<r4-channel-card .channel=${c.follower_id} origin=${this.channelOrigin}></r4-channel-card>
						</li>`
				)}
			</ul>
		`
	}

	createRenderRoot() {
		return this
	}
}
