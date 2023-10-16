import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowers extends BaseChannel {
	renderHeader() {
		return html`
			<h1>Channels following ${this.slug}</h1>
			<nav>
				<nav-item><code>@</code> <a href=${this.channelOrigin}>${this.params.slug}</a></nav-item>
				<nav-item>
					<code>/</code>
					<a href=${this.channelOrigin + '/following'}>following</a>, followers &
					<a href=${this.channelOrigin + '/feed'}>feed</a>
				</nav-item>
			</nav>
		`
	}
	renderMain() {
		return html` <r4-channel-followers slug=${this.slug} href=${this.config.href}></r4-channel-followers> `
	}
}
