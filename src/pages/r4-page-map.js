// import BaseChannel from './base-channel'
import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageMap extends R4Page {
	static properties = {
		config: {type: Object},
		searchParams: {type: Object},
	}
	render() {
		return html`
			<r4-map
				href=${this.config.href}
				latitude=${this.searchParams.get('latitude')}
				longitude=${this.searchParams.get('longitude')}
			></r4-map>
		`
	}
}
