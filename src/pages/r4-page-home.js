import { LitElement, html } from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		store: { type: Object, state: true }
	}

	render() {
		const authed = this.store.user
		return html`
			<p>page: ${this.store.count}</p>
			<header>
				Welcome to <r4-title></r4-title>.
				<br>
				${authed ? html`<strong>${this.store.user.email}</strong>` : null}
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
						Create a <a href="/new">new channel</a>.
					</li>
				</menu>
			</section>
		`
	}
	createRenderRoot() {
		return this
	}
}
