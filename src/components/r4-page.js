import {LitElement, html} from 'lit'

/**
 * A DOM structure/pattern for pages to re-use for consistency
 */
export default class R4Page extends LitElement {
	render() {
		return html`
			<r4-page-header> ${this.renderHeader()} </r4-page-header>
			<r4-page-main> ${this.renderMain()} </r4-page-main>
			<r4-page-aside> ${this.renderAside()} </r4-page-aside>
		`
	}
	renderHeader() {}
	renderMain() {}
	renderAside() {}

	createRenderRoot() {
		return this
	}
}
