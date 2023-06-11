import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'
import { query } from '../libs/browse'

export default class R4PageChannel extends BaseChannel {
	get coordinates() {
		if (this.channel.longitude && this.channel.latitude) {
			return {
				longitude: this.channel.longitude,
				latitude: this.channel.latitude,
			}
		}
		return undefined
	}

	get loadingValue() {
		if (this.params.slug) {
			return 50
		}
		if (this.channel) {
			return 75
		}
		return 0
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
		if (this.isFirebaseChannel) {
			return html`
				<radio4000-player channel-slug=${this.params.slug}></radio4000-player>
				<p>This channel has not yet migrated to the new Radio4000. That's ok, you can still listen.</p>
			`
		} else if (!this.channel && !this.channelError) {
			return this.renderLoading()
		} else if (this.channel) {
			return this.renderChannel()
		} else if (this.channelError) {
			return this.renderChannelError()
		}
	}

	renderLoading() {
		return html`<progress value=${this.loadingValue} max="100"></progress> `
	}

	renderChannelError() {
		return html`<p>404 - This channel does not exist</p>`
	}

	async onQuery({detail}) {
		this.tracks = (await query(detail)).data
	}

	renderChannel() {
		const {channel} = this
		if (!channel) return html`<p>Loading...</p>`

		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${channel.slug}</a>
					<code>/</code>
				</nav-item>
				<nav-item><r4-button-play .channel=${channel} label="Listen"></r4-button-play></nav-item>
				<nav-item>
					<r4-channel-actions
						slug=${channel.slug}
						?can-edit=${this.canEdit}
						?single-channel=${this.config.singleChannel}
						@input=${this.onChannelAction}
					></r4-channel-actions>
				</nav-item>
				<nav-item><r4-channel-social>${this.renderSocial()}</r4-channel-social></nav-item>
				<nav-item>
					${
						this.coordinates && !this.config.singleChannel
							? html`<r4-channel-coordinates>${this.renderMap()}</r4-channel-coordinates>`
							: null
					}
				</nav-item>
			</nav>

			${channel.image ? this.renderChannelImage() : null}

			<r4-channel-name>
				<h1>${channel.name}</h1>
			</r4-channel-name>

			<r4-channel-description>${channel.description}</r4-channel-description>

			${
				channel.url
					? html`<r4-channel-url>
							<a target="_blank" ref="norel noreferer" href=${channel.url}>${channel.url}</a>
					  </r4-channel-url>`
					: null
			}

			<h2>Latest tracks</h2>
			<r4-supabase-query
				table="channel_tracks"
				filters="[{"operator":"eq","column":"slug","value":"ko002"}]"
				limit="5"
				@query=${this.onQuery} hiddenui></r4-supabase-query>
			${this.renderTracksList()}

			<footer><a href="${`${this.channelOrigin}/tracks`}">All tracks</a></footer>

			<r4-dialog name="share" @close=${this.onDialogClose}>
				<r4-channel-sharer slot="dialog" origin=${this.channelOrigin} slug=${channel.slug}></r4-channel-sharer>
			</r4-dialog>
		`
	}

	renderTracksList() {
		if (!this.tracks) return null
		console.log(this.tracks)
		return html`
			<ul list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => html` <li>
						<r4-button-play .channel=${this.channel} .track=${t} .tracks=${this.tracks}></r4-button-play>
						<r4-track .track=${t} href=${this.config.href} origin=${'' || this.tracksOrigin}></r4-track></li> `
				)}
			</ul>
		`
	}


	renderSocial() {
		if (!this.config.singleChannel) {
			return html`
				<button @click=${this.alreadyFollowing ? this.unfollow : this.follow}>
					${this.alreadyFollowing ? 'Unfollow' : 'Follow'}
				</button>
				<span hidden>${this.followsYou ? 'follows you' : "doesn't follow you"}</span>
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
	async onChannelAction({detail}) {
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

	onDialogClose({target}) {
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
