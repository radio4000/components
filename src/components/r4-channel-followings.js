import {LitElement, html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'

export default class R4ChannelFollowings extends LitElement {
	static properties = {
		slug: {type: String, reflect: true},
		channels: {type: Array, state: true},
		href: {type: String}
	}

	async query() {
		this.channels = (
			await sdk.supabase
				.from('followers')
				.select('*, channel_id(*), follower_id!inner(slug)')
				.eq('follower_id.slug', this.slug)
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
							<r4-channel-card .channel=${c.channel_id} origin=${this.href + `/{{slug}}`}></r4-channel-card>
						</li>`
				)}
			</ul>
		`
	}

	createRenderRoot() {
		return this
	}
}
