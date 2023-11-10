// import BaseChannel from './base-channel'
import {html} from 'lit'
import BaseChannels from './base-channels.js'

export default class R4PageMap extends BaseChannels {
	renderMain() {
		return html`
			<r4-map
				href=${this.config.href}
				latitude=${this.searchParams.get('latitude')}
				longitude=${this.searchParams.get('longitude')}
			></r4-map>
		`
	}
}
