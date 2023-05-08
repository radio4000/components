import { html } from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelPlayer extends BaseChannel {
	render() {
		if (!this.channel) return
		return html`
			<a href=${this.channelOrigin}>
				<r4-avatar
					slug=${this.channel.slug}
					></r4-avatar>
			</a>
			<r4-button-play
				.channel=${this.channel}
				></r4-button-play>
		`
	}

	createRenderRoot() {
		return this
	}
}
