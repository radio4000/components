import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'

/**
 * Button to follow or unfollow a channel
 */
export default class R4ButtonFollow extends LitElement {
	static properties = {
		/** Whether to render a follow or unfollow state */
		following: {type: Boolean},
		followerChannel: {type: Object, state: true},
		channel: {type: Object, state: true},
	}

	async follow() {
		if (!this.followerChannel) return
		await sdk.channels.followChannel(this.followerChannel.id, this.channel.id)
		this.following = true
	}

	async unfollow() {
		if (!this.followerChannel) return
		await sdk.channels.unfollowChannel(this.followerChannel.id, this.channel.id)
		this.following = false
	}

	render() {
		return this.following ? this.renderUnfollow() : this.renderFollow()
	}

	renderUnfollow() {
		return html`
			<button @click=${this.unfollow} title=${`Unfollow @${this.channel.slug}`}>
				<r4-icon name="unfollow"></r4-icon>
			</button>
		`
	}

	renderFollow() {
		return html`
			<button
				@click=${this.follow}
				title=${`Fllow @${this.channel.slug}`}
				?disabled=${!this.followerChannel}
			>
				<r4-icon name="follow"></r4-icon>
			</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
