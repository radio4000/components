import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageSettings extends R4Page {
	static properties = {
		/* props */
		store: {type: Object, state: true},
		searchParams: {type: Object, state: true},
		config: {type: Object, state: true},
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	async changeEmail(event) {
		event.preventDefault()
	}

	async changePassword(event) {
		event.preventDefault()
	}

	renderHeader() {
		const {user} = this.store
		return html`
			<menu>
				<li>
					<h1>
						<a href="${this.config.href}/settings">Settings</a>
					</h1>
				</li>
			</menu>
			<p>Application configuration and user settings.</p>
		`
	}

	renderMain() {
		if (this.store.user) {
			return [this.renderUserChannels(), this.renderAppearance(), this.renderAuthentication(), this.renderUserDelete()]
		} else {
			return [this.renderNoUser()]
		}
	}

	renderNoUser() {
		return html`
			<section>
				<h2>Account</h2>
				<p>Your are signed out.</p>
				<ul>
					<li><a href="${this.config.href}/sign/in">Sign in</a> an existing account</li>
					<li><a href="${this.config.href}/sign/up">Sign up</a> to register a new account</li>
					<li><a href="${this.config.hrefMigrate}">Migrate </a> from version 1 to a version 2 radio channel</li>
				</ul>
			</section>
		`
	}

	renderUserChannels() {
		const {userChannels} = this.store
		return html`
			<section>
				<h2>Channel${userChannels?.length > 1 ? 's' : ''}</h2>
				<ul>
					${userChannels.map(
						(x) =>
							html`<li>
								<a href=${`${this.config.href}/${x.slug}`}>${x.name}</a>
								(<a href=${`${this.config.href}/${x.slug}/update`}>update</a>)
							</li>`,
					)}
					${!this.store?.userChannels.length
						? html`<li>
								No channels yet. <a href=${this.config.href + '/new'}>Create a new radio</a> or
								<a href=${this.config.hrefV1}>import from v1</a>.
							</li>`
						: null}
				</ul>
			</section>
		`
	}

	renderAppearance() {
		return html`
			<section>
				<r4-user-account .account=${this.store.userAccount}></r4-user-account>
			</section>
		`
	}

	renderAuthentication() {
		return html`
			<section>
				<h2>Authentication</h2>
				<p>
					You are signed-in as <em>${this.store?.user?.email}</em> (<a href="${this.config.href}/sign/out">sign out</a
					>).
				</p>
				${this.store.user.new_email ? this.renderNewEmail() : null}
				<details>
					<summary>Update sign-in email or password</summary>
					<section>
						<r4-email-update email=${this.store.user.email} @submit=${this.changeEmail}></r4-email-update>
					</section>
					<section>
						<r4-password-update @submit=${this.changePassword}></r4-password-update>
					</section>
				</details>
			</section>
		`
	}
	renderUserDelete() {
		return html`
			<section>
				<h2>User account</h2>
				<r4-user-delete
					.user=${this.store.user}
					.userChannels=${this.store.userChannels}
					.href=${this.config.href}
				></r4-user-delete>
			</section>
		`
	}

	renderNewEmail() {
		return html`
			<mark>
				<i>${this.store.user.new_email}</i>
				(waiting for confirmation)
			</mark>
		`
	}
	renderAbout() {
		return html`
			<section>
				<h2>About <r4-title></r4-title> (<r4-title size="small"></r4-title>)</h2>
				<p>The project is built by and for its users</p>
				<ul>
					<li>Contact by <a href="mailto:contact@radio4000.com">email</a></li>
					<li>Community <a href="https://matrix.to/#/#radio4000:matrix.org" rel="noreferrer"> chat </a></li>
					<li>Source <a href="https://github.com/radio4000" rel="noreferrer">code</a></li>
					<li>
						Read the
						<a href="https://github.com/radio4000/publications/blob/main/user-agreement-privacy-policy-terms-of-use.md"
							>privacy/terms</a
						>
					</li>
					<li>See the <a href="https://blog.radio4000.com/">blog</a></li>
				</ul>
			</section>
		`
	}

	renderFooter() {
		return this.renderAbout()
	}

	createRenderRoot() {
		return this
	}
}
