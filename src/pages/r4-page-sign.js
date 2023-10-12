import page from 'page/page.mjs'
import {LitElement} from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'

export default class R4PageSign extends LitElement {
	static properties = {
		params: {type: Object, state: true},
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	render() {
		const {method} = this.params
		return html`
			<header>
				<h1>Sign ${method ? method : null}</h1>
			</header>
			<main>${method ? this.renderMethodPage(method) : this.renderMethodSelection()}</main>
			${this.renderAside()}
		`
	}
	renderMethodPage(method) {
		const tag = literal`r4-sign-${unsafeStatic(method)}`
		// eslint-disable-next-line
		return html`<${tag} @submit=${this.onSignSubmit}></${tag}>`
	}

	renderMethodSelection() {
		return html`
			<aside>
				<p>To use <r4-title></r4-title>, sign into your user account.</p>
				<r4-menu direction="row">
					<a href=${`${this.config.href}/sign`}>sign</a>
					<a href=${`${this.config.href}/sign/up`}>up</a>
					<a href=${`${this.config.href}/sign/in`}>in</a>
					<a href=${`${this.config.href}/sign/out`}>out</a>
				</r4-menu>
			</aside>
		`
	}

	renderAside() {
		if (this.params.method === 'in') {
			return html`<details>
				<summary>Forgot password?</summary>
				<r4-reset-password></r4-reset-password>
				<blockquote>Enter the email address of the account, to receive the password reset instructions.</blockquote>
			</details>`
		} else if (this.params.method === 'up') {
			return html`<p><a href=${this.config.href + `/sign/in`}>Sign in</a> if you already have an existing account.</p>`
		}
	}

	/* submitting the curent methods's form */
	onSignSubmit({detail: {data}}) {
		if (this.params.method === 'in' && data && data.user) {
			page('/')
		}
		if (this.params.method === 'out') {
			page('/')
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}

	/* handy redirects */
	connectedCallback() {
		super.connectedCallback()
		if (this.store.user && this.params.method === 'in') {
			page('/sign/out')
		}
		if (!this.store.user && this.params.method === 'out') {
			page('/sign/in')
		}
	}
}
