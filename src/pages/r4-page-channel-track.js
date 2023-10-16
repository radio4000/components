import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannelTrack from './base-channel-track'

export default class R4PageChannelTrack extends BaseChannelTrack {
	renderHeader() {
		return html`
			<r4-channel-card .channel=${this.channel} origin=${this.channelOrigin}></r4-channel-card>
		`
	}
	renderMain() {
		return html`
				<r4-track
					id=${this.params.track_id}
					.channel=${this.channel}
					.track=${this.track}
					.canEdit=${this.canEdit}
					origin=${this.tracksOrigin}
					></r4-track>
		`
	}
}
