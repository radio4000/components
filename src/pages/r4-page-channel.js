import { html } from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import { sdk } from '@radio4000/sdk'

export default class R4PageChannel extends BaseChannel {
	get coordinates() {
		if (this.channel.longitude && this.channel.latitude) {
			return {
				longitude: this.channel.longitude,
				latitude: this.channel.latitude,
			}
		}
	}

	follow() {
		if (!this.store.user || !this.store.userChannels) return
		const userChannel = this.store.userChannels.find((c) => c.slug === this.config.selectedSlug)
		return sdk.channels.followChannel(userChannel.id, this.channel.id)
	}

	unfollow() {
		if (!this.store.user || !this.store.userChannels) return
		const userChannel = this.store.userChannels.find((c) => c.slug === this.config.selectedSlug)
		return sdk.channels.unfollowChannel(userChannel.id, this.channel.id)
	}

	render() {
		const { channel } = this
		if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		if (!channel) return html`<p>Loading...</p>`

		return html`
			<menu>
				<li>
					<code>@</code>
					<a href=${this.channelOrigin}>${channel.slug}</a>
					<code>/</code>
				</li>
				<li>
					<r4-channel-actions
						slug=${channel.slug}
						?can-edit=${this.canEdit}
						?single-channel=${this.config.singleChannel}
						@input=${this.onChannelAction}
					></r4-channel-actions>
				</li>
				<li><r4-button-play .channel=${channel}></r4-button-play></li>
				<li><r4-channel-social>${this.renderSocial()}</r4-channel-social></li>
				<li>
					${this.coordinates && !this.config.singleChannel
						? html`<r4-channel-coordinates>${this.renderMap()}</r4-channel-coordinates>`
						: null}
				</li>
			</menu>

			<r4-channel-name>
				<h1>${channel.name}</h1>
			</r4-channel-name>

			<r4-channel-description>${channel.description}</r4-channel-description>

			${channel.url
				? html`<r4-channel-url>
						<a target="_blank" ref="norel noreferer" href=${channel.url}>${channel.url}</a>
				  </r4-channel-url>`
				: null}
			${channel.image ? this.renderChannelImage() : null}

			<ul>
				<li>
					Last 5 tracks:
					<r4-tracks channel=${channel.slug} origin=${this.tracksOrigin} limit="5"></r4-tracks>
				</li>
				<li><a href="${`${this.channelOrigin}/tracks`}">All tracks</a></li>
			</ul>

			<r4-dialog name="share" @close=${this.onDialogClose}>
				<r4-channel-sharer slot="dialog" origin=${this.channelOrigin} slug=${channel.slug}></r4-channel-sharer>
			</r4-dialog>
		`
	}

	renderSocial() {
		if (!this.config.singleChannel) {
			return html`
				<button @click=${this.alreadyFollowing ? this.unfollow : this.follow}>
					${this.alreadyFollowing ? 'Unfollow' : 'Follow'}
				</button>
				<span>${this.followsYou ? 'follows you' : "doesn't follow you"}</span>
			`
		}
	}

	renderChannelImage() {
		return html`<aside>
			<a href=${this.channelOrigin + '/player'}>
				<r4-avatar image=${this.channel.image}></r4-avatar>
			</a>
		</aside>`
	}

	renderMap() {
		const mapUrl = `${this.config.href}/map/?longitude=${this.coordinates.longitude}&latitude=${this.coordinates.latitude}&slug=${this.channel.slug}`
		return html`<a href=${mapUrl}>✵</a>`
	}

	/* event handlers from <r4-channel-actions> */
	async onChannelAction({ detail }) {
		if (detail) {
			if (detail === 'play' && this.channel) {
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: this.channel,
					},
				})
				this.dispatchEvent(playEvent)
			}
			if (detail === 'create-track') {
				if (this.config.singleChannel) {
					page('/add')
				} else {
					page(`/add/?slug=${this.params.slug}`)
				}
			}
			if (detail === 'tracks') {
				if (this.config.singleChannel) {
					page(`/tracks`)
				} else {
					page(`/${this.params.slug}/tracks`)
				}
			}
			if (detail === 'update') {
				page(`/${this.params.slug}/update`)
			}
			if (detail === 'followings') {
				page(`/${this.params.slug}/followings`)
			}
			if (detail === 'followers') {
				page(`/${this.params.slug}/followers`)
			}
			if (['share'].indexOf(detail) > -1) {
				this.openDialog(detail)
			}
		}
	}

	onDialogClose({ target }) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.config.singleChannel) {
				page('/track')
			} else {
				page(`/${this.params.slug}/tracks`)
			}
		}
	}

	openDialog(name) {
		const $dialog = this.querySelector(`r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.setAttribute('visible', true)
		}
	}

	closeDialog(name) {
		const $dialog = this.querySelector(`r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.removeAttribute('visible')
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
