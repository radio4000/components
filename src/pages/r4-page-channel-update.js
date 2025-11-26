import {html} from 'lit'
import page from '../libs/page.js'
import {sdk} from '../libs/sdk.js'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	renderHeader() {
		return null
	}
	renderMain() {
		const {channel, channelOrigin} = this
		if (!this.channel) {
			return ''
		} else if (this.channel && !this.canEdit) {
			return html`<p>You don't have permissions to edit this channel.</p>`
		} else if (this.channel) {
			return this.renderChannel()
		}
	}
	renderChannel() {
		const {channel, channelOrigin} = this
		return html`
			<section>
				<header id="channel">
					<h2>
						<a href="#channel">Channel</a>
					</h2>
					<p>Edit the public attributes and configuration of the radio channel.</p>
				</header>

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
			</section>

			<section id="avatar">
				<header>
					<h2><a href="#avatar">Avatar</a></h2>
				</header>
				<r4-avatar-update slug=${channel.slug} image=${channel.image}></r4-avatar-update>
			</section>

			<section id="map">
				<header>
					<h2><a href="#map">Map</a></h2>
				</header>
				<r4-map-position .channel=${channel} @submit=${this.onMapSubmit} href=${this.config.href}></r4-map-position>
			</section>
			<section>
				<h2>Delete channel</h2>
				<p>To <a href="${channelOrigin}/delete">delete this channel</a> permanently.</p>
			</section>
		`
	}

	async onUpdate({detail}) {
		const newSlug = detail?.data?.slug
		if (newSlug && newSlug !== this.params.slug) {
			page(`/${newSlug}/update`)
		}
		if (!detail.error && detail.data) {
			// we good, update (missing id)
			this.channel = detail.data
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
			const {data, error} = await sdk.channels.readChannel(this.channel.slug)
			if (data) {
				this.channel = data
			}
		} catch (error) {
			console.error('error saving map data', error)
		}
	}

	createRenderRoot() {
		return this
	}
}
