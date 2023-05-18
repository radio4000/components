import {html} from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'

export default class R4PageChannelUpdate extends BaseChannel {
	render() {
		const {channel} = this
		if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		if (!channel) return html`<p>Loading...</p>`
		// if (!this.canEdit) return html`<p>You don't have permission to edit this channel.</p>`

		const currentUserChannel = this.store.userChannels.find((channel) => {
			return channel.id === this.channel.id
		})

		return html`
			<header>
				<p>
					<code>@</code>
					<a href=${this.buildChannelHref(channel)}>${channel.slug}</a>
					<code>/</code>
					update
				</p>
			</header>
			<main>
				<r4-channel-update
					id=${currentUserChannel.id}
					slug=${currentUserChannel.slug}
					name=${currentUserChannel.name}
					description=${currentUserChannel.description}
					url=${currentUserChannel.url}
					longitude=${currentUserChannel.longitude}
					latitude=${currentUserChannel.latitude}
					@submit=${this.onChannelUpdate}
				></r4-channel-update>
				<br />
				<r4-avatar-update slug=${currentUserChannel.slug}></r4-avatar-update>
				<br />
				<r4-map-position
					@submit=${this.onMapSubmit}
					longitude=${currentUserChannel.longitude}
					latitude=${currentUserChannel.latitude}
				></r4-map-position>
				<br />
				<details>
					<summary>Delete channel</summary>
					<r4-channel-delete id=${currentUserChannel.id} @submit=${this.onChannelDelete}></r4-channel-delete>
				</details>
			</main>
		`
	}

	async onChannelDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}

	async onChannelUpdate({ detail }) {
		const newSlug = detail?.data?.slug
		if (newSlug && newSlug !== this.params.slug) {
			page(`/${newSlug}`)
		}
		if (!detail.error && detail.data) {
			// we good
		}
	}

	async onMapSubmit({
		detail
	}) {
		const channelId = this.channel.id
		if (!channelId) return

		let res
		try {
			if (detail) {
				res = await sdk.channels.updateChannel(channelId, {
					longitude: detail.longitude,
					latitude: detail.latitude,
				})
			} else {
				res = await sdk.channels.updateChannel(channelId, {
					longitude: null,
					latitude: null,
				})
			}
		} catch(error) {
			console.log('error saving map data', error)
		}
	}

	createRenderRoot() {
		return this
	}
}
