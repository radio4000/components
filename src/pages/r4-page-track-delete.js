import {html} from 'lit'
import {sdk} from '../libs/sdk.js'
import page from '../libs/page.js'
import BaseChannelTrack from './base-channel-track'

export default class R4PageTrackDelete extends BaseChannelTrack {
	renderHeader() {
		return null
	}
	renderMain() {
		if (this.trackError) {
			return html`Error: ${this.error.message}`
		}
		if (!this.track) {
			return html`<p>Loading...</p>`
		}
		return html`
			<r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card>
			<r4-track .track=${this.track} .config=${this.config} href==${this.config.href} origin=${this.tracksOrigin}></r4-track>
			<p>
				Confirm deleting the track <a href=${this.channelOrigin + '/tracks/' + this.track.id}>${this.track.title}</a>
				from <a href=${this.channelOrigin}>${this.params.slug}</a>'s
				list of <a href=${this.channelOrigin + '/tracks'}>tracks</a>?
			</p>
			<r4-track-delete id=${this.track.id} @submit=${this.onDelete}></r4-channel-delete>
		`
	}
}
