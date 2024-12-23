import {html} from 'lit'
import BaseChannel from './base-channel'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '../libs/sdk.js'

export default class R4PageChannelFollowers extends BaseChannel {
	static properties = {
		channels: {type: Array, state: true},
		loaded: {type: Boolean}
	}

	async connectedCallback() {
		await super.connectedCallback()
		if (this.channel && !this.channels) {
			await this.setChannels()
			this.loaded = true
		} else {
			this.loaded = true
		}
	}

	async setChannels() {
		this.channels = (
			await sdk.supabase
				.from('followers')
				.select('*, channel_id!inner(slug), follower_id(*)')
				.eq('channel_id.slug', this.channel.slug)
		).data
	}

	renderMain() {
		if (!this.loaded) return
		if (this.channels?.length) {
			return this.renderChannels()
		} else {
			return this.renderNoChannels()
		}
	}
	renderChannels() {
		return html`
			<section>
				<r4-list>
					${repeat(
						this.channels || [],
						(c) => c.id,
						(c) => this.renderChannel(c),
					)}
				</r4-list>
			</section>
		`
	}
	renderChannel(c) {
		return html` <r4-list-item>
			<r4-channel-card .channel=${c.follower_id} origin=${this.config.href + '/{{slug}}'}> </r4-channel-card>
		</r4-list-item>`
	}
	renderNoChannels() {
		return html` <section>No followers yet.</section> `
	}
}
