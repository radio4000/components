import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

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
				Unfollow
			</button>
		`
	}
	renderFollow() {
		return html`
			<button @click=${this.follow} title="Subscribe to this channel's updates, by following it">Follow</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
