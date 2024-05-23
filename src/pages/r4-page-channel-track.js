import {html} from 'lit'
import BaseChannelTrack from './base-channel-track'

export default class R4PageChannelTrack extends BaseChannelTrack {
	renderMain() {
		return [this.buildTrack(), this.buildDiscogs()]
	}
	buildTrack() {
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
	buildDiscogs() {
		if (this.track?.discogs_url) {
			return html`<r4-discogs-resource
				url=${this.track.discogs_url}
				href=${this.config.href}
				full="true"
			></r4-discogs-resource>`
		}
	}
}
