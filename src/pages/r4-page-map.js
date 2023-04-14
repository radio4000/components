// import BaseChannel from './base-channel'
import {LitElement, html} from 'lit'

export default class R4PageMap extends LitElement {
	render() {
		return html`
			<h1>Map</h1>
			<r4-map></r4-map>
		`
	}

	createRenderRoot() {
		return this
	}
}
