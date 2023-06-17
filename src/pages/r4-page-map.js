// import BaseChannel from './base-channel'
import {LitElement, html} from 'lit'

export default class R4PageMap extends LitElement {
	static properties = {
		config: {type: Object},
		searchParams: {type: Object},
	}
	render() {
		return html`
			<header>
				<nav>
					<nav-item><code>/</code><a href=${`${this.config.href}/explore`}>explore</a></nav-item>
					<nav-item><code>></code> <a href=${`${this.config.href}/search`}>Search</a> + Map</nav-item>
				</nav>
				<h1>Map</h1>
			</header>
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
