import {LitElement, html} from 'lit'

export default class R4PageSearch extends LitElement {
	render() {
		return html`
			<h1>Search all channels</h1>
			<r4-channel-search href=${this.config.href}></r4-channel-search>
		`
	}

	createRenderRoot() {
		return this
	}
}
