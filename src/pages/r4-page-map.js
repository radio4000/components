// import BaseChannel from './base-channel'
import {LitElement, html} from 'lit'

export default class R4PageMap extends LitElement {
	static properties = {
		config: { type: Object },
		query: { type: Object },
	}
	render() {
		return html`
			<h1>Map</h1>
			<r4-map
				href=${this.config.href}
				latitude=${this.query.latitude}
				longitude=${this.query.longitude}
				slug=${this.query.slug}
			></r4-map>
		`
	}

	createRenderRoot() {
		return this
	}
}
