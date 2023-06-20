import {html} from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelDelete extends BaseChannel {
	render() {
		const link = this.channelOrigin
		const channel = this.store.userChannels.find((channel) => {
			return channel.id === this.channel?.id
		})
		return html`
			<nav>
				<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
				${this.canEdit ? html`<nav-item><a href=${link + '/update'}>Update</a></nav-item>` : ''}
				${this.canEdit ? html`<nav-item>Delete</nav-item>` : ''}
			</nav>
			<main>
				<h1>Delete channel</h1>
				${channel ? html`<r4-channel-delete id=${channel.id} @submit=${this.onChannelDelete}></r4-channel-delete>` : ''}
			</main>
		`
	}

	async onChannelDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}

	createRenderRoot() {
		return this
	}
}
