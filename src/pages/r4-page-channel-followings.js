import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowings extends BaseChannel {
	static properties = {
		channels: {type: Array, state: true},
	}

	async query() {
		this.channels = (
			await sdk.supabase
				.from('followers')
				.select('*, channel_id(*), follower_id!inner(slug)')
				.eq('follower_id.slug', this.channel.slug)
		).data
	}

	render() {
		const {channel} = this
		if (channel?.slug && !this.channels) this.query()
		return html`
			<header>
				<code>@</code> <a href=${this.channelOrigin}>${channel?.slug}</a> <code>/</code>
				<a href=${this.channelOrigin + '/followings'}>followings</a>
			</header>
			<main>
				<p>Channels which ${channel?.slug} follows</p>
				<ul list>
					${repeat(
						this.channels || [],
						(c) => c.id,
						(c) =>
							html`<li>
								<r4-channel-card .channel=${c.channel_id} origin=${this.channelOrigin}></r4-channel-card>
							</li>`
					)}
				</ul>
			</main>
		`
	}

	createRenderRoot() {
		return this
	}
}
