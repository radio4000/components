import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'
import {query} from '../libs/browse'

export default class R4PageChannel extends BaseChannel {
	get tracksQueryFilters() {
		return [{operator: 'eq', column: 'slug', value: `${this.channel.slug}`}]
	}
	get coordinates() {
		if (this.channel.longitude && this.channel.latitude) {
			return {
				longitude: this.channel.longitude,
				latitude: this.channel.latitude,
			}
		}
		return undefined
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

	renderMain() {
		if (this.isFirebaseChannel) {
			return html`<radio4000-player channel-slug=${this.params.slug}></radio4000-player>`
		}
		if (this.channelError) {
		}
		if (this.channel) {
			return html`
				<section>
					<r4-supabase-query
						table="channel_tracks"
						filters="${this.tracksQueryFilters}"
						limit="8"
						@query="${this.onQuery}"
						hidden
					></r4-supabase-query>
					${this.renderTracksList()}
				</section>
			`
		}
	}

	renderTracksList() {
		if (!this.tracks) return null
		return html`
			<r4-list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => this.renderTrackItem(t)
				)}
			</r4-list>
		`
	}
	renderTrackItem(track) {
		return html`
			<r4-list-item>
				<r4-track
					.track=${track}
					href=${this.config.href}
					origin=${this.tracksOrigin}
					.canEdit=${this.canEdit}
					?playing=${this.config.playingTrack?.id === track.id}
					.channel=${this.channel}
				></r4-track>
			</r4-list-item>
		`
	}
}
