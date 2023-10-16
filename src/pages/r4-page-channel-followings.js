import {html} from 'lit'
import BaseChannel from './base-channel'

export default class R4PageChannelFollowings extends BaseChannel {
	renderHeader() {
		return html` <h1>${this.channel?.slug} follows</h1> `
	}
	renderMain() {
		return html`<r4-channel-followings slug=${this.channel.slug} href=${this.config.href}></r4-channel-followings>`
	}
}
