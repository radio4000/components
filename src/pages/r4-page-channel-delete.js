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
			<r4-page-header>
				<nav>
					<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
					${this.canEdit ? html`<nav-item><a href=${link + '/update'}>Update</a></nav-item>` : ''}
					${this.canEdit ? html`<nav-item>Delete</nav-item>` : ''}
				</nav>
			</r4-page-header>
			<r4-page-main>
				<h1>Delete channel</h1>
				${channel ? html`<r4-channel-delete id=${channel.id} @submit=${this.onDelete}></r4-channel-delete>` : ''}
			</r4-page-main>
		`
	}

	async onDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}

	createRenderRoot() {
		return this
	}
}
