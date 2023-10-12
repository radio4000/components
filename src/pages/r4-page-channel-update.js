import {html} from 'lit'
import page from 'page/page.mjs'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	render() {
		const {channel, channelOrigin: link} = this
		if (channel && !this.canEdit) return html`<p>You don't have permissions to edit this channel.</p>`
		return html`
			<r4-page-header>
				<nav>
					<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
					${this.canEdit ? html`<nav-item>Update</nav-item>` : ''}
					${this.canEdit ? html`<nav-item><a href=${link + '/delete'}>Delete</a></nav-item>` : ''}
				</nav>
				<h1>Update channel settings</h1>
			</r4-page-header>
			<r4-page-main> ${channel ? this.renderChannel() : ''} </r4-page-main>
		`
	}
	renderChannel() {
		return html`
			<r4-channel-update
				id=${channel.id}
				slug=${channel.slug}
				name=${channel.name}
				description=${channel.description}
				url=${channel.url}
				longitude=${channel.longitude}
				latitude=${channel.latitude}
				@submit=${this.onUpdate}
			></r4-channel-update>

			<h2>Avatar</h2>
			<r4-avatar-update slug=${channel.slug}></r4-avatar-update>

			<h2>Map</h2>
			<r4-map-position
				@submit=${this.onMapSubmit}
				longitude=${channel.longitude}
				latitude=${channel.latitude}
			></r4-map-position>

			<p><a href="${link}/delete">Delete channel</a></p>
		`
	}

	async onUpdate({detail}) {
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
