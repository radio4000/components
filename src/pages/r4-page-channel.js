import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'
import {sdk} from '@radio4000/sdk'
import {query} from '../libs/browse'

export default class R4PageChannel extends BaseChannel {
	static properties = {
		tracksQueryFilters: {type: Array, state: true, reflect: true},
	}
	get tracksQueryFilters() {
		return [{operator: 'eq', column: 'slug', value: this.channel?.slug}]
	}

	async getTracks() {
		const channelTracksQuery = {
			table: 'channel_tracks',
			select: '*',
			filters: this.tracksQueryFilters,
			orderBy: 'created_at',
			orderConfig: {
				ascending: false,
			},
			page: 1,
			limit: 8,
		}
		return (await query(channelTracksQuery)).data
	}
	async connectedCallback() {
		super.connectedCallback()
		await this.setChannel()
		await this.setTracks()
	}
	async willUpdate(changedProperties) {
		await super.willUpdate(changedProperties)
		if (changedProperties.has('channel')) {
			await this.setTracks()
		}
	}
	async setTracks() {
		this.tracks = await this.getTracks()
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
