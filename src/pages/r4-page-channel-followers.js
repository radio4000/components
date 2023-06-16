import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowers extends BaseChannel {
	static properties = {
		channels: {type: Array, state: true},
	}

	async query() {
		this.channels = (await sdk.supabase
			.from('followers')
			.select('*, channel_id!inner(slug), follower_id(*)')
			.eq('channel_id.slug', this.channel.slug)).data
	}

	render() {
		const {channel} = this
		if (channel?.slug && !this.channels) this.query()
		return html`
			<header>
				<code>@</code>
				<a href=${this.channelOrigin}>${channel?.slug}</a>
				<code>/</code>
				<a href=${this.channelOrigin + '/followers'}>followers</a>
			</header>
			<main>
				<p>Channels following ${channel?.slug}</p>
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
			</main>
		`
	}

	createRenderRoot() {
		return this
	}
}
