import {html} from 'lit'
import {sdk} from '../libs/sdk.js'
import page from 'page/page.mjs'
import BaseChannelTrack from './base-channel-track'

export default class R4PageChannelUpdate extends BaseChannelTrack {
	renderHeader() {
		if (this.trackError) {
			return html`<p>Error: ${this.error.message}</p>`
		}
		if (!this.track) {
			return html`<p>Loading...</p>`
		}
		return html`
			<r4-channel-card
				.channel=${this.channel}
				origin=${this.channelOrigin}
				></r4-channel-card>
			<r4-track
				.track=${this.track}
				.config=${this.config}
				href==${this.config.href}
				origin=${this.tracksOrigin}
				></r4-track>
		`
	}
	renderMain() {
		if (this.trackError) {
			return html`<p>Error: ${this.error.message}</p>`
		}
		if (!this.track) {
			return html`<p>Loading...</p>`
		}
		return html`
			<r4-track-update
				id=${this.track.id}
				url=${this.track.url}
				title=${this.track.title}
				discogsUrl=${this.track.discogsUrl}
				description=${this.track.description}
				@submit=${this.onUpdate}
			></r4-track-update>
		`
	}
}
