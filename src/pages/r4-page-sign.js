import page from 'page/page.mjs'
import { LitElement } from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'

export default class R4PageSign extends LitElement {
	static properties = {
		params: { type: Object, state: true }
	}
	render() {
		const {method} = this.params
		return html`
			<header>
				Sign ${method ? method : null}
			</header>
			<main>
				${method ? this.renderMethodPage(method) : this.renderMethodSelection()}
			</main>
		`
	}
	renderMethodPage(method) {
		const tag = literal`r4-sign-${unsafeStatic(method)}`
		return html`<${tag} @submit=${this.onSignSubmit}></${tag}>`
	}

	renderMethodSelection() {
		return html`
			<aside>
				<p>
					To use <r4-title></r4-title>, sign into your user account.
				</p>
				<r4-menu direction="row">
					<a href="/sign">sign</a>
					<a href="/sign/up">up</a>
					<a href="/sign/in">in</a>
					<a href="/sign/out">out</a>
				</r4-menu>
			</aside>
		`
	}
	onSignSubmit({
		detail: {
			data
		}
	}) {
		if (this.params.method === 'in' && data && data.user) {
			page('/')
		}
		if (this.params.method === 'out') {
			page('/')
		}
	}
	createRenderRoot() {
		return this
	}
}
