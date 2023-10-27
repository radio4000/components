import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'
import {browse} from '../libs/browse'

export default class R4PageChannel extends BaseChannel {
	async willUpdate(changedProperties) {
		await super.willUpdate(changedProperties)
		if (changedProperties.has('channel')) {
			console.log('fetching tracks because channel changed')
			await this.setTracks()
		}
	}

	get defaultFilters() {
		return [{operator: 'eq', column: 'slug', value: this.channel?.slug}]
	}

	async setTracks() {
		const channelTracksQuery = {
			table: 'channel_tracks',
			select: '*',
			filters: this.defaultFilters,
			orderBy: 'created_at',
			orderConfig: {
				ascending: false,
			},
			page: 1,
			limit: 8,
		}
		this.tracks =  (await browse(channelTracksQuery)).data
	}

	renderMain() {
		if (this.isFirebaseChannel) {
			return html`<radio4000-player channel-slug=${this.params.slug}></radio4000-player>`
		}
		if (this.channelError) {
		}
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
					(t) => this.renderTrackItem(t)
				)}
			</r4-list>
			<r4-supabase-query table="channel_tracks" />
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
