import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	async loadTrack() {
		const {data, error} = await sdk.tracks.readTrack(this.params.track_id)
		this.track = data
		this.error = error
	}
	async connectedCallback() {
		super.connectedCallback()
		if (!this.track) {
			await this.loadTrack()
			console.log(this.track)
			console.log(this.channel)
		}
		if (!this.canEdit) {
			/* page(this.channelOrigin + '/tracks/' + this.track.id) */
		}
	}
	render() {
		if (!this.track) {
			return html`<p>Loading...</p>`
		}

		if (this.error) {
			return html`<p>Error: ${this.error.message}</p>`
		}
		return html`
			<r4-page-header>
				<r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card>
				<r4-track
					.track=${this.track}
					.config=${this.config}
					href==${this.config.href}
					origin=${this.tracksOrigin}
					></r4-track>
			</r4-page-header>
			<r4-page-main>
				<r4-track-update
					id=${this.track.id}
					url=${this.track.url}
					title=${this.track.title}
					discogsUrl=${this.track.discogsUrl}
					description=${this.track.description}
					@submit=${this.onUpdate}
					></r4-track-update>
			</r4-page-main>
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
