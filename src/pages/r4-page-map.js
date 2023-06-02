// import BaseChannel from './base-channel'
import {LitElement, html} from 'lit'

export default class R4PageMap extends LitElement {
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
				slug=${this.searchParams.get('slug')}
			></r4-map>
		`
	}

	createRenderRoot() {
		return this
	}
}
