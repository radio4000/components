import { LitElement, html } from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		store: { type: Object, state: true }
	}

	render() {
		return html`
			<header>
				<h1><r4-title></r4-title></h1>
				<p>Welcome to</p>
			</header>
			<section>
				<menu>
					<li>
						Start <a href="${this.href}/explore">exploring channels</a> to discover new content
					</li>
					<li>
						Play a <r4-title small="true"></r4-title> channel
					</li>
					<li>
						Create a <a href="/new">new channel</a>
					</li>
				</menu>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}
}
