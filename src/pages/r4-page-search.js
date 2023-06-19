import {LitElement, html} from 'lit'

export default class R4PageSearch extends LitElement {
	render() {
		return html`
			<header>
				<nav>
					<nav-item><code>/</code><a href=${`${this.config.href}/explore`}>explore</a></nav-item>
					<nav-item><code>></code> Search + <a href=${`${this.config.href}/map`}>Map</a></nav-item>
				</nav>
			</header>
			<h1>Search all channels</h1>
			<r4-channel-search href=${this.config.href}></r4-channel-search>
		`
	}

	createRenderRoot() {
		return this
	}
}
