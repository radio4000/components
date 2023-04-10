import page from 'page/page.mjs'
import { LitElement } from 'lit'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import sdk from '@radio4000/sdk'

export class R4ResetPasswordForm extends LitElement {
	static properties = {
		email: {type: String, reflect: true},
		msg: {type: String, state: true},
		loading: {type: Boolean, state: true}
	}

	async submit(event) {
		event.preventDefault()
		this.loading = true
		const email = event.target.email.value
		if (!email) return
		const {error} = await sdk.supabase.auth.resetPasswordForEmail(email, {redirectTo: '/settings'})
		if (error) console.log(error)
		this.msg = error ? error.message : 'Check your email to continue resetting your password'
		this.loading = false
	}

	render() {
		return html`
			<form @submit=${this.submit}>
				<label>Email <input type="email" name="email" value=${this.email} autocomplete="username" required></label>
				<button type="submit" ?disabled=${this.loading}>${this.loading ? 'Sending...' : 'Send a password reset request'}</button>
				${this.msg ? html`<p>${this.msg}</p>` : null}
			</form>
		`
	}

	createRenderRoot() {
		return this
	}
}

customElements.define('r4-reset-password', R4ResetPasswordForm)

export default class R4PageSign extends LitElement {
	static properties = {
		params: { type: Object, state: true },
		config: { type: Object, state: true },
		store: { type: Object, state: true },
	}

	render() {
		const {method} = this.params
		return html`
			<header>
				<h1>Sign ${method ? method : null}</h1>
			</header>
			<main>
				${method ? this.renderMethodPage(method) : this.renderMethodSelection()}

				<details>
					<summary>Forgot your password?</summary>
					<r4-reset-password />
				</details>
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
					<a href=${`${this.config.href}/sign`}>sign</a>
					<a href=${`${this.config.href}/sign/up`}>up</a>
					<a href=${`${this.config.href}/sign/in`}>in</a>
					<a href=${`${this.config.href}/sign/out`}>out</a>
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
