import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelPlayer extends BaseChannel {
	render() {
		if (!this.channel) return
		return html`
			<r4-page-header>
				<menu>
					<li>@<a href=${this.channelOrigin}>${this.channel.slug}</a></li>
					<li>
						<r4-button-play .channel=${this.channel}></r4-button-play>
					</li>
				</menu>
			</r4-page-header>

			<r4-page-main>
				<a href=${this.channelOrigin}>
					<r4-avatar slug=${this.channel.slug}></r4-avatar>
				</a>
			</r4-page-main>
		`
	}

	createRenderRoot() {
		return this
	}
}
