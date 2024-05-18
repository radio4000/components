// import BaseChannel from './base-channel'
import {html} from 'lit'
import {sdk} from '../libs/sdk.js'
import BaseChannels from './base-channels.js'

export default class R4PageMap extends BaseChannels {
	renderMain() {
		return html`
			<r4-map
				href=${this.config.href}
				latitude=${this.searchParams.get('latitude')}
				longitude=${this.searchParams.get('longitude')}
				zoom=${this.searchParams.get('zoom')}
				slug=${this.searchParams.get('slug')}
			></r4-map>
		`
	}
}
