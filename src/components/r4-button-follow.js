import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'

export default class R4ButtonFollow extends LitElement {
	static properties = {
		following: {type: Boolean},
		channel: {type: Object, state: true},
		userChannel: {type: Object, state: true},
	}

	follow() {
		if (!this.userChannel) return
		return sdk.channels.followChannel(this.userChannel.id, this.channel.id)
	}

	unfollow() {
		if (!this.userChannel) return
		return sdk.channels.unfollowChannel(this.userChannel.id, this.channel.id)
	}

	render() {
		if (this.following) {
			return this.renderUnfollow()
		} else {
			return this.renderFollow()
		}
	}
	renderUnfollow() {
		return html`
			<button @click=${this.unfollow} title="Un-subscribe from this channel's updates, by un-following it">
				<r4-icon name="unfollow"></r4-icon>
			</button>
		`
	}
	renderFollow() {
		return html`
			<button
				@click=${this.follow}
				?disabled=${!this.userChannel}
				title="Subscribe to this channel's updates, by following it"
			>
				<r4-icon name="follow"></r4-icon>
			</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
