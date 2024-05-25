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
		`
	}

	renderMain() {
		if (this.store.user) {
			return [this.renderChannels(), this.renderAuthentication(), this.renderAppearance(), this.renderUserDelete()]
		} else {
			return [this.renderNoUser()]
		}
	}

	renderNoUser() {
		return html`
			<section href="account">
				<header>
					<h2><a href="#account">Account</a></h2>
					<p>Manage and explore radio channels with a Radio4000 account.</p>
				</header>
				<menu>
					<li><a href="${this.config.href}/sign/in">Sign in</a> (manage radio)</li>
					<li><a href="${this.config.href}/sign/up">Sign up</a> (create new account)</li>
				</menu>
				<p>Can't find your existing radio? <a href="${this.config.hrefMigrate}">Import radio from version1</a> site.</p>
			</section>
		`
	}

	renderChannels() {
		return html`
			<section id="channel">
				<header>
					<h2>
						<a href="#channel">Channel${this.store.userChannels?.length > 1 ? 's' : ''}</a>
					</h2>
				</header>
				<r4-list> ${!this.store.userChannels?.length ? this.renderNoChannel() : this.renderUserChannels()} </r4-list>
			</section>
		`
	}

	renderNoChannel() {
		return html`
			<r4-list-item>
				<p>No channels yet.</p>
				<p><a href=${this.config.href + '/new'}>Create a new radio</a>.</p>
				<p><a href=${this.config.hrefV1}>Import existing radio from v1</a>.</p>
			</r4-list-item>
		`
	}

	renderUserChannels() {
		return this.store.userChannels.map(
			(channel) => html`
				<r4-list-item>
					<r4-channel-card .channel=${channel} origin="${this.config.href}/${channel.slug}"></r4-channel-card>
				</r4-list-item>
			`,
		)
	}

	renderAppearance() {
		return html`
			<section id="appearance">
				<header>
					<h2><a href="#appearance">Appearance</a></h2>
					<p>Customize the app's look and feel.</p>
				</header>
				<r4-user-account .account=${this.store.userAccount}></r4-user-account>
			</section>
		`
	}

	renderAuthentication() {
		return html`
			<section id="authentication">
				<header>
					<h2><a href="#authentication">Authentication</a> (<a href="${this.config.href}/sign/out">Sign out</a>)</h2>
				</header>
				<r4-email-display>
					<form>
						${this.store.user.new_email ? this.renderNewEmail() : null}
						<fieldset>
							<legend>Email</legend>
							<input disabled value=${this.store?.user?.email} />
						</fieldset>
					</form>
				</r4-email-display>
				<r4-email-update email=${this.store.user.email} @submit=${this.changeEmail}></r4-email-update>
				<r4-password-update @submit=${this.changePassword}></r4-password-update>
			</section>
		`
	}

	renderUserDelete() {
		return html`
			<section id="account">
				<header>
					<h2><a href="#account">Account</a></h2>
					<p>User account management.</p>
				</header>
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
			<fieldset>
				<legend>New email</legend>
				<p><mark>${this.store.user.new_email}</mark>${' '}</p>
				<p>
					<i>Click the confirmation link sent to this Email inbox, to validate the Email change</i>
				</p>
			</fieldset>
		`
	}
	renderAbout() {
		return html`
			<section id="about">
				<header>
					<h2>
						<a href="#about">About <r4-title></r4-title></a>
					</h2>
					<p>Information and contact.</p>
				</header>
				<ul>
					<li>
						Community
						<a href="https://matrix.to/#/#radio4000:matrix.org" target="_blank" rel="noreferrer noopener"
							>chat and support</a
						>
					</li>
					<li>Contact by <a href="mailto:contact@radio4000.com" target="_blank" rel="noreferrer noopener">email</a></li>
					<li>Source <a href="https://github.com/radio4000" target="_blank" rel="noreferrer noopener">code</a></li>
					<li>
						Read the
						<a
							href="https://github.com/radio4000/publications/blob/main/user-agreement-privacy-policy-terms-of-use.md"
							target="_blank"
							rel="noreferrer noopener"
							>privacy/terms</a
						>
					</li>
					<li>See the <a href="https://blog.radio4000.com/" target="_blank" rel="noreferrer noopener">blog</a></li>
					<li>
						Previous site <a href=${this.config.hrefV1} target="_blank" rel="noreferrer noopener">v1.radio4000</a>
					</li>
					<li><a href=${this.config.hrefMigrate} target="_blank" rel="noreferrer noopener">Import/migrate</a> radio</li>
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
