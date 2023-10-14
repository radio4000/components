import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	async loadTrack() {
		const {data, error} = await sdk.tracks.readTrack(this.params.track_id)
		this.track = data
		this.error = error
	}
	render() {
		if (!this.track) {
			this.loadTrack()
		}
		if (this.error) {
			return html`<p>Error: ${this.error.message}</p>`
		}
		return html`
			<r4-page-header>
				<r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card>
				<h1>Update track</h1>
				<r4-track
					.track=${this.track}
					.config=${this.config}
					href==${this.config.href}
					origin=${this.tracksOrigin}
					></r4-track>
			</r4-page-header>
			<r4-page-main> ${this.track ? this.renderTrack() : html`<p>Loading...</p>`} </r4-page-main>
			`
	}
	renderTrack() {
		return html`
			<r4-track-update
				id=${this.track.id}
				url=${this.track.url}
				title=${this.track.title}
				discogsUrl=${this.track.discogsUrl}
				description=${this.track.description}
				@submit=${this.onUpdate}
			></r4-track-update>
			<p>
				<a href=${this.channelOrigin + '/tracks/' + this.track.id + '/delete'}>Delete track</a>
			</p>
		`
	}
	async onUpdate({detail}) {
		if (!detail.error) {
			// all good
		}
	}
	createRenderRoot() {
		return this
	}
}
