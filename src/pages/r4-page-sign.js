import page from 'page/page.mjs'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import R4Page from '../components/r4-page.js'

export default class R4PageSign extends R4Page {
	static properties = {
		params: {type: Object, state: true},
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}
	migrateUrl = 'https://migrate.radio4000.com'

	renderHeader() {
		return html`
			<h1>Sign ${this.params.method ? this.params.method : null}</h1>
			<p>User authentication, <i>signing</i> <strong>${this.params.method}</strong> to <r4-title></r4-title></p>
		`
	}
	renderMain() {
		const {method} = this.params
		return html`
			<section>${method ? this.renderMethodPage(method) : this.renderMethodSelection()}</section>
			${this.renderFooter()}
		`
	}
	renderMethodPage(method) {
		const tag = literal`r4-sign-${unsafeStatic(method)}`
		// eslint-disable-next-line
		return html`<${tag} @submit=${this.onSignSubmit}></${tag}>`
	}

	renderMethodSelection() {
		return html`
			<p>To use <r4-title></r4-title>, sign into your user account.</p>
			<r4-menu direction="row">
				<a href=${this.config.href + '/sign'}>sign</a>
				<a href=${this.config.href + '/sign/up'}>up</a>
				<a href=${this.config.href + '/sign/in'}>in</a>
				<a href=${this.config.href + '/sign/out'}>out</a>
			</r4-menu>
		`
	}

	renderFooter() {
		if (this.params.method === 'in') {
			return this.renderForgotPass()
		} else if (this.params.method === 'up') {
			return this.renderExistingAccount()
		}
	}
	renderForgotPass() {
		return html`
			<section>
				<ul>
					<li>
						<details>
							<summary>Forgot password?</summary>
							<i>Enter the email address of the account, to receive the password reset instructions.</i>
							<r4-password-reset></r4-password-reset>
						</details>
					</li>
					<li><a href=${this.config.href + '/sign/up'}>Sign up</a> if you don't yet have an account.</li>
				</ul>
			</section>
		`
	}
	renderExistingAccount() {
		return html`
			<section>
				<ul>
					<li>
						Sign-up first, to <a href=${this.migrateUrl}>import/migrate</a> an existing radio (from the previous
						<a href="https://radio4000.com">site</a>).
					</li>
					<li>
						<a href=${this.config.href + '/sign/in'}>Sign in</a>
						if you already have an existing account.
					</li>
				</ul>
			</section>
		`
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
