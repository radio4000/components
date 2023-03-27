import { LitElement, html } from 'lit'

export default class R4PageHome extends LitElement {
	get href() {
		return this.getAttribute('href')
	}
	render() {
		return html`
			<header>
				Welcome to <r4-title></r4-title>.
			</header>
			<section>
				<menu>
					<li>
						Start <a href="${this.href}/explore">exploring channels</a> to discover new content.
					</li>
					<li>
						Select a <r4-title small="true"></r4-title> channel to play its content.
					</li>
					<li>
						Create a <a href="${this.href}/new">new channel</a>.
					</li>
				</menu>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}
}
