import {html} from 'lit'
import BaseChannelTrack from './base-channel-track'

export default class R4PageChannelTrack extends BaseChannelTrack {
	renderMain() {
		return html`
			<section>
				<r4-track
					.channel=${this.channel}
					.track=${this.track}
					.canEdit=${this.canEdit}
					origin=${this.tracksOrigin}
					href=${this.config.href}
				></r4-track>
			</section>
		`
	}
}
