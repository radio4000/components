// import BaseChannel from './base-channel'
import {html} from 'lit'
import {sdk} from '../libs/sdk.js'
import BaseChannels from './base-channels.js'

export default class R4PageMap extends BaseChannels {
	static properties = {
		// from router's searchParam to map
		channel: {type: Object},
	}
	async connectedCallback() {
		super.connectedCallback()
		const slug = this.searchParams.get('slug')
		if (slug) {
			const {data, error} = await sdk.channels.readChannel(slug)
			if (error) {
				console.log('error', error)
			} else {
				this.channel = data
			}
		}
	}
	renderMain() {
		return html`
			<r4-map
				href=${this.config.href}
				latitude=${this.searchParams.get('latitude')}
				longitude=${this.searchParams.get('longitude')}
				zoom=${this.searchParams.get('zoom')}
				.channel=${this.channel}
			></r4-map>
		`
	}
}
