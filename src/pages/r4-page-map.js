// import BaseChannel from './base-channel'
import {html} from 'lit'
import BaseChannels from './base-channels.js'

export default class R4PageMap extends BaseChannels {
	connectedCallback() {
		super.connectedCallback()
		// Overwrite default limit to avoid pagination.
		this.query.limit = 4000
	}
	renderMain() {
		return html`
			<r4-map
				href=${this.config.href}
				latitude=${this.searchParams.get('latitude')}
				longitude=${this.searchParams.get('longitude')}
				.channels=${this.channels}
			></r4-map>
		`
	}
}
