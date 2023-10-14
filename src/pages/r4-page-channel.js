import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'
import {query} from '../libs/browse'

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

	async onQuery({detail}) {
		this.tracks = (await query(detail)).data
	}

	render() {
		if (this.isFirebaseChannel) {
			return html`
				<r4-page-header>
					<h1>@${this.params.slug}</h1>
					<p>This channel has not yet migrated to the new Radio4000. That's ok, you can still listen.</p>
				</r4-page-header>
				<r4-page-main>
					<radio4000-player channel-slug=${this.params.slug}></radio4000-player>
				</r4-page-main>
			`
		}

		if (this.channelError) {
			return html` <r4-page-main> ${this.renderChannelError()} </r4-page-main> `
		}

		return html`
			<r4-page-header> ${this.channel ? [this.renderChannelCard(), this.renderChannelMenu()] : null} </r4-page-header>
			<r4-page-main> ${this.channel ? this.renderChannel() : null} </r4-page-main>
		`
	}
	renderChannelCard() {
		return html`
			<r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card>
			${this.channel.url ? this.renderChannelUrl() : null}
		`
	}
	renderChannelUrl() {
		const {url} = this.channel
		if (url) {
			return html`
				<r4-channel-url>
					<a target="_blank" ref="norel noreferer" href=${url}>${url}</a>
				</r4-channel-url>
			`
		}
	}
	renderChannelMenu() {
		return html`
			<menu>
				<li>
					<r4-channel-actions
						slug=${this.channel.slug}
						?can-edit=${this.canEdit}
						?single-channel=${this.config.singleChannel}
						@input=${this.onChannelAction}
					></r4-channel-actions>
				</li>
				<li><r4-channel-social>${this.renderSocial()}</r4-channel-social></li>
				${this.coordinates && !this.config.singleChannel
					? html`<li><r4-channel-coordinates>${this.renderMap()}</r4-channel-coordinates></li>`
					: null}
				<li>
					<a href="${`${this.channelOrigin}/tracks`}">Tracks</a>
				</li>
			</menu>
		`
	}

	renderChannelError() {
		return html`<p>404. There is no channel here. Want to <a href="${this.config.href}/new">create one?</a></p>`
	}

	renderChannel() {
		return html`
			<section>
				<r4-supabase-query
					table="channel_tracks"
					filters=${`[{"operator":"eq","column":"slug","value":"${this.channel.slug}"}]`}
					limit="8"
					@query=${this.onQuery}
					hidden
				></r4-supabase-query>
				${this.renderTracksList()}
			</section>
			<r4-dialog name="share" @close=${this.onDialogClose}>
				<r4-share slot="dialog" origin=${this.channelOrigin} slug=${this.channel.slug}></r4-share>
			</r4-dialog>
		`
	}

	renderTracksList() {
		if (!this.tracks) return null
		return html`
			<r4-list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => html`
						<r4-list-item>
							<r4-button-play .channel=${this.channel} .track=${t} .tracks=${this.tracks}></r4-button-play>
							<r4-track
								.track=${t}
								href=${this.config.href}
								origin=${'' || this.tracksOrigin}
								.canEdit=${this.canEdit}
								?playing=${this.config.playingTrack?.id === t.id}
							></r4-track>
						</r4-list-item>
					`
				)}
			</r4-list>
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

	renderChannelImage(image) {
		if (!image) return null
		return html` <r4-avatar image=${image} size="small"></r4-avatar> `
	}

	renderMap() {
		const mapUrl = `${this.config.href}/map/?longitude=${this.coordinates.longitude}&latitude=${this.coordinates.latitude}&slug=${this.channel.slug}`
		return html`<a href=${mapUrl}><r4-icon name="map_position"></r4-icon></a>`
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
			if (detail === 'following') {
				page(`/${this.params.slug}/following`)
			}
			if (detail === 'followers') {
				page(`/${this.params.slug}/followers`)
			}
			if (detail === 'feed') {
				page(`/${this.params.slug}/feed`)
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
