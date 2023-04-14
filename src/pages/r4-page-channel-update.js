import { html } from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	render() {
		const { channel } = this
		if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		if (!channel) return html`<p>Loading...</p>`
		// if (!this.canEdit) return html`<p>You don't have permission to edit this channel.</p>`

		return html`
			<header>
				<h1>&larr; <a href=${`/${channel.slug}`}>${channel.name}</a></h1>
				<p>@${channel.slug}</p>
				<p>${channel.description}</p>
			</header>
			<main>
				<r4-channel-update
					id=${channel.id}
					slug=${channel.slug}
					name=${channel.name}
					description=${channel.description}
					url=${channel.url}
					longitude=${channel.longitude}
					latitude=${channel.latitude}
					@submit=${this.onChannelUpdate}
				></r4-channel-update>
				<br />
				<r4-avatar-update slug=${channel.slug}></r4-avatar-update>
				<br />
				<details>
					<summary>Delete channel</summary>
					<r4-channel-delete id=${channel.id} @submit=${this.onChannelDelete}></r4-channel-delete>
				</details>
			</main>
		`
	}

	async onChannelDelete({ detail }) {
		/* no error? we deleted */
		if (!detail.data) {
			page('/')
		}
	}

	async onChannelUpdate({ detail }) {
		const {
			data: { slug: newSlug },
		} = ({} = detail)

		if (newSlug && newSlug !== this.params.slug) {
			page(`/${newSlug}`)
		}
		if (!detail.error && detail.data) {
			// we good
		}
	}

	createRenderRoot() {
		return this
	}
}
