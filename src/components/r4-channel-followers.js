import {LitElement, html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'

export default class R4ChannelFollowers extends LitElement {
	static properties = {
		slug: {type: String, reflect: true},
		channels: {type: Array, state: true},
		href: {type: String},
	}

	async setChannels() {
		this.channels = (
			await sdk.supabase
				.from('followers')
				.select('*, channel_id!inner(slug), follower_id(*)')
				.eq('channel_id.slug', this.slug)
		).data
	}
	connectedCallback() {
		super.connectedCallback()
		if (this.slug && !this.channels) this.setChannels()
	}

	render() {
		if (this.channels) {
			return this.renderChannels()
		}
	}
	renderChannels() {
		return html`
			<r4-list>
				${repeat(
					this.channels || [],
					(c) => c.id,
					(c) => this.renderChannel(c)
				)}
			</r4-list>
		`
	}
	renderChannel(c) {
		return html` <r4-list-item>
			<r4-channel-card .channel=${c.follower_id} origin=${this.href + '/{{slug}}'}> </r4-channel-card>
		</r4-list-item>`
	}

	createRenderRoot() {
		return this
	}
}
