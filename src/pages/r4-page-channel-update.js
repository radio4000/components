import {html} from 'lit'
import page from 'page/page.mjs'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	render() {
		const {channel} = this
		const link = this.channelOrigin

		// if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		// if (!channel) return html`<p>Loading...</p>`
		// if (channel && !this.canEdit) return html`<p>You don't have permissions to edit this channel.</p>`

		const currentUserChannel = this.store.userChannels.find((channel) => {
			return channel.id === this.channel?.id
		})

		return html`
			<nav>
				<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
				${this.canEdit ? html`<nav-item>Update</nav-item>` : ''}
				${this.canEdit ? html`<nav-item><a href=${link + '/delete'}>Delete</a></nav-item>` : ''}
			</nav>
			<main>
				<h1>Update channel settings</h1>
				${currentUserChannel
					? html`
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
							<h2>Avatar</h2>
							<r4-avatar-update slug=${currentUserChannel.slug}></r4-avatar-update>
							<h2>Map</h2>
							<r4-map-position
								@submit=${this.onMapSubmit}
								longitude=${currentUserChannel.longitude}
								latitude=${currentUserChannel.latitude}
							></r4-map-position>
						<p><a href="${this.channelOrigin}/delete">Delete channel</a></p>
					  `
					: ''}
			</main>
		`
	}

	async onChannelDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}

	async onChannelUpdate({detail}) {
		const newSlug = detail?.data?.slug
		if (newSlug && newSlug !== this.params.slug) {
			page(`/${newSlug}`)
		}
		if (!detail.error && detail.data) {
			// we good
		}
	}

	async onMapSubmit({detail}) {
		const channelId = this.channel.id
		if (!channelId) return

		try {
			if (detail) {
				await sdk.channels.updateChannel(channelId, {
					longitude: detail.longitude,
					latitude: detail.latitude,
				})
			} else {
				await sdk.channels.updateChannel(channelId, {
					longitude: null,
					latitude: null,
				})
			}
		} catch (error) {
			console.log('error saving map data', error)
		}
	}

	createRenderRoot() {
		return this
	}
}
