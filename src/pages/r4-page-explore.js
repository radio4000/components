import {html, LitElement} from 'lit'

export default class R4PageExplore extends LitElement {
	static properties = {
		/* props */
		config: { type: Object },
	}
	get channelOrigin() {
		return `${this.config.href}/{{slug}}`
	}
	render() {
		return html`
			<header>
				<h1>Explore</h1>
				<p>All <r4-title ></r4-title> channels.</p>
				<p>View the <a href="/map">R4 Map</a>.</p>
			</header>
			<section>
				<r4-channels
					origin=${this.channelOrigin}
					pagination="true"
					limit="15"
				></r4-channels>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}
}
