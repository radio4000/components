import {html} from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelDelete extends BaseChannel {
	renderHeader() {
		return html`
			<h1>Delete channel</h1>
			<p>Permanently delete this radio channel and all its content?</p>
			<p>This will remove all references to <a href=${this.channelOrigin}>${this.params.slug}</a> in the database.</p>
		`
	}
	renderMain() {
		if (this.channel) {
			return html`<r4-channel-delete id=${this.channel.id} @submit=${this.onDelete}></r4-channel-delete>`
		}
	}
	async onDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}
}
