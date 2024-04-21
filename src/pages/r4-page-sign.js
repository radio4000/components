import page from 'page/page.mjs'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import R4Page from '../components/r4-page.js'

export default class R4PageSign extends R4Page {
	static properties = {
		/* props */
		params: {type: Object, state: true},
		config: {type: Object, state: true},
		store: {type: Object, state: true},

		/* state */
		user: {type: Object, state: true},
		showConfirmEmail: {type: Boolean, state: true},
	}

	get showConfirm() {
		return this.showConfirmEmail && this.params.method === 'up'
	}

	get email() {
		return this.user?.email
	}
	connectedCallback() {
		super.connectedCallback()
		if (this.store.user && this.params.method === 'in') {
			page('/sign/out')
		}
		if (!this.store.user && this.params.method === 'out') {
			page('/sign/in')
		}
	}
	renderHeader() {
		return html`
			<h1>Sign ${this.params.method ? this.params.method : null}</h1>
			<p>User authentication, <i>signing</i> <strong>${this.params.method}</strong> to <r4-title></r4-title></p>
		`
	}
	renderMain() {
		const {method} = this.params
		return html`
			${method ? this.renderMethodPage(method) : this.renderMethodSelection()}
			${this.showConfirm ? this.renderConfirmEmail() : null} ${this.renderFooter()}
		`
	}
	renderMethodPage(method) {
		if (this.showConfirm) {
			return null
		}
		const tag = literal`r4-sign-${unsafeStatic(method)}`
		// eslint-disable-next-line
		return html`
			<section>
				<${tag} @submit=${this.onSignSubmit} email=${this.email}></${tag}>
			</section>
		`
	}

	renderMethodSelection() {
		return html`
			<p>To use <r4-title></r4-title>, sign into your user account.</p>
			<menu>
				<li><a href=${this.config.href + '/sign'}>sign:</a></li>
				<li><a href=${this.config.href + '/sign/up'}>up (new account)</a></li>
				<li><a href=${this.config.href + '/sign/in'}>in (existing account)</a></li>
				<li><a href=${this.config.href + '/sign/out'}>out (logout account)</a></li>
			</menu>
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
				<p>Need help? <a href=${this.config.href + `/about`}>About &rarr;</a></p>
				<ul>
					<li><a href=${this.config.href + '/sign/up'}>Sign up</a> if you don't yet have an account.</li>
					<li>
						<details>
							<summary>Forgot password? Sign in with magic link!</summary>
							<i
								>Enter the email address of the account, to receive a magic link to sign in without password. You can
								then reset your password from the settings page.</i
							>
							<r4-password-reset email=${this.email} @submit=${this.onPasswordReset}></r4-password-reset>
						</details>
					</li>
				</ul>
			</section>
		`
	}
	renderExistingAccount() {
		return html`
			<section>
				<p>Need help? <a href=${this.config.href + `/about`}>About &rarr;</a></p>
				<ul>
					<li>
						<a href=${this.config.href + '/sign/in'}>Sign in</a>
						if you already have an existing account.
					</li>
					<li>
						Sign up first, to <a href="${this.config.hrefMigrate}">import/migrate</a> an existing radio (from the
						previous <a href="https://radio4000.com">site</a>).
					</li>
				</ul>
			</section>
		`
	}
	renderConfirmEmail() {
		return html`
			<section>
				<h3>Account created!</h3>
				<p>Check your email inbox for a confirmation link from <r4-title></r4-title>.</p>
				<p>
					When the email's account is confirmed,
					<a href=${this.config.href + '/sign/in'}>sign-in</a>
					to get started.
				</p>
				<p>
					Also
					<a href=${this.config.href + '/sign/in'}>sign-in with "magic link" </a>
					if you cannot find the confirmation email.
				</p>
			</section>
		`
	}

	/* submitting the curent methods's form */
	onSignSubmit({detail: {data}}) {
		if (data?.user) {
			this.user = data.user
		}
		if (this.params.method === 'up' && data?.user?.id) {
			this.showConfirmEmail = true
		}
		if (this.params.method === 'in' && data && data.user) {
			page('/')
		}
		if (this.params.method === 'out') {
			page('/')
		}
	}
	onPasswordReset(event) {}
}
