import { html } from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelPlayer extends BaseChannel {
	render() {
		if (!this.channel) return
		return html`
			<menu>
				<li>@<a href=${this.channelOrigin}>${this.channel.slug}</a></li>
				<li>
					<r4-button-play .channel=${this.channel}></r4-button-play>
				</li>
			</menu>

			<a href=${this.channelOrigin}>
				<r4-avatar slug=${this.channel.slug}></r4-avatar>
			</a>
		`
	}

	createRenderRoot() {
		return this
	}
}
