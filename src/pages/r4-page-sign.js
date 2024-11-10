import page from 'page/page.mjs'
import {html, literal, unsafeStatic} from 'lit/static-html.js'
import R4Page from '../components/r4-page.js'

const texts = {
	up: 'Create a new account',
	in: 'Use an existing account',
	out: 'Disconnect the current signed-in account',
}

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
			<menu>
				<li>
					<h1>
						<a href="${this.config.href}/sign/${this.params.method}">
							Sign-<i>${this.params.method ? this.params.method : null}</i>
						</a>
					</h1>
				</li>
			</menu>
			<p><r4-title></r4-title> user authentication.</p>
		`
	}

	renderMain() {
		const {method} = this.params
		return html`
			${method ? this.renderMethodPage(method) : this.renderMethodSelection()}
			${this.showConfirm ? this.renderConfirmEmail() : null}
		`
	}

	renderMethodPage(method) {
		if (this.showConfirm) {
			return null
		}
		const tag = literal`r4-sign-${unsafeStatic(method)}`
		const text = texts[method]
		// eslint-disable-next-line
		return html`
			<section>
				<p>${text}</p>
				<${tag} @submit=${this.onSignSubmit} email=${this.email} hcaptcha-site-key=${this.config.hcaptchaSiteKey}></${tag}>
			</section>
		`
	}

	renderMethodSelection() {
		return html`
			<ol>
				<li><a href=${this.config.href + '/sign/up'}>Sign up</a> a new account</li>
				<li><a href=${this.config.href + '/sign/in'}>Sign in</a> an existing account</li>
				<li><a href=${this.config.href + '/sign/out'}>Sign out</a> current account</li>
			</ol>
		`
	}

	renderFooter() {
		if (this.params.method === 'in') {
			return this.renderSignInFooter()
		} else if (this.params.method === 'up') {
			return this.renderSignOutFooter()
		}
	}

	renderSignInFooter() {
		return html`
			<section>
				<ul>
					<li><a href=${this.config.href + '/sign/up'}>Sign up</a> if you don't yet have an account</li>
					<li>
						<details>
							<summary>Forgot password? Sign in with magic link!</summary>
							<p>Enter the email address of the account, to receive a magic link to sign in without password.</p>
							<p>It is then possible to reset the password from the settings page.</p>
							<r4-password-reset
								email=${this.email}
								@submit=${this.onPasswordReset}
								hcaptcha-site-key=${this.config.hcaptchaSiteKey}
							></r4-password-reset>
						</details>
					</li>
				</ul>
			</section>
		`
	}

	renderSignOutFooter() {
		return html`
			<section>
				<ul>
					<li>
						<a href=${this.config.href + '/sign/in'}>Sign in</a>
						if you already have an existing account
					</li>
					<li>
						Sign up first, to <a href="${this.config.hrefMigrate}">import/migrate</a> an existing radio (from the
						<a href="https://v1.radio4000.com" target="_blank">version 1</a> of <r4-title></r4-title>).
					</li>
				</ul>
				<p>Need help? See chat and email support on the <a href=${this.config.href + `/settings`}>settings</a> page.</p>
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
