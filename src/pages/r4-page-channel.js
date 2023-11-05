import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannel from './base-channel'
import {browse} from '../libs/browse'

export default class R4PageChannel extends BaseChannel {
	async willUpdate(changedProperties) {
		await super.willUpdate(changedProperties)
		if (changedProperties.has('channel')) {
			console.log('fetching tracks because channel changed')
			await this.setTracks()
		}
	}

	get queryWithDefaults() {
		return {
			table: 'channel_tracks',
			select: '*',
			filters: [{operator: 'eq', column: 'slug', value: this.channel?.slug}],
			orderBy: 'created_at',
			order: 'desc',
			page: 1,
			limit: 8,
		}
	}

	async setTracks() {
		this.tracks = (await browse(this.queryWithDefaults)).data
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html`<radio4000-player channel-slug=${this.params.slug}></radio4000-player>`
		}
		// if (this.channelError) {}
		if (this.channel) {
			return html` <section>${this.renderTracksList()}</section> `
		}
	}

	renderTracksList() {
		if (!this.tracks) return null
		return html`
			<r4-list>
				${repeat(
					this.tracks,
					(t) => t.id,
					(t) => this.renderTrackItem(t),
				)}
			</r4-list>
			<r4-supabase-query table="channel_tracks" order=${this.searchParams.get('order')}></r4-supabase-query>
		`
	}

	renderTrackItem(track) {
		return html`
			<r4-list-item>
				<r4-track
					.track=${track}
					.channel=${this.channel}
					.canEdit=${this.canEdit}
					href=${this.config.href}
					origin=${this.tracksOrigin}
					?playing=${this.config.playingTrack?.id === track.id}
				></r4-track>
			</r4-list-item>
		`
	}
}
