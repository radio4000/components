import {html, LitElement} from 'lit'

export default class R4PageExplore extends LitElement {
	get href() {
		return this.getAttribute('href')
	}
	get channelOrigin() {
		return `${this.href}/{{slug}}`
	}
	render() {
		return html`
			<header>
				<h1>Explore</h1>
				<p>
					All <r4-title ></r4-title> channels.
				</p>
			</header>
			<section>
				<r4-channels origin=${this.channelOrigin} pagination="true" limit="15"></r4-channels>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}
}
