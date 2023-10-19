import {html} from 'lit'
import {until} from 'lit/directives/until.js'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannelTrack from './base-channel-track'

export default class R4PageChannelTrack extends BaseChannelTrack {
	renderMain() {
		return html`
			<r4-track
				.channel=${this.channel}
				.track=${this.track}
				.canEdit=${this.canEdit}
				origin=${this.tracksOrigin}
				href=${this.config.href}
			></r4-track>
		`
	}
}
