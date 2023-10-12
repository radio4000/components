import {LitElement, html} from 'lit'

export default class R4PageSearch extends LitElement {
	render() {
		return html`
			<r4-page-main>
				<r4-channel-search href=${this.config.href} autofocus></r4-channel-search>
			</r4-page-main>
		`
	}

	createRenderRoot() {
		return this
	}
}
