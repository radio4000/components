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
			<h1>Settings</h1>
			<p>Application configuration and user settings.</p>
		`
	}
	renderMain() {
		if (this.store.user) {
			return [this.renderAppearance(), this.renderUser()]
		} else {
			return [this.renderNoUser()]
		}
	}
	renderUser() {
		return html`
			<section>
				<h2>Channels</h2>
				<ul>
					${this.store?.userChannels.map(
						(x) =>
							html`<li>
								<a href=${`${this.config.href}/${x.slug}`}>${x.name}</a>
								(<a href=${`${this.config.href}/${x.slug}/update`}>update</a>)
							</li>`,
					)}
					${!this.store?.userChannels.length
						? html`<li>No channels yet. <a href=${this.config.href + '/new'}>Create a new radio</a></li>`
						: null}
				</ul>
			</section>
			<section>
				<h2>Account</h2>
				<p>
					You are signed in as <em>${this.store?.user?.email}</em> (<a href="${this.config.href}/sign/out">sign out</a
					>).
				</p>
				${this.store.user.new_email ? this.renderNewEmail() : null}
				<r4-email-update email=${this.store.user.email} @submit=${this.changeEmail}></r4-email-update>
				<r4-password-update @submit=${this.changePassword}></r4-password-update>
			</section>
			<section>
				<h2>Danger zone</h2>
				<r4-user-delete
					.user=${this.store.user}
					.userChannels=${this.store.userChannels}
					.href=${this.config.href}
				></r4-user-delete>
			</section>
		`
	}
	renderNoUser() {
		return html`
			<section>
				<h2>Account</h2>
				<p>Your are signed out.</p>
				<ul>
					<li><a href="${this.config.href}/sign/in">Sign in</a> an existing account</li>
					<li><a href="${this.config.href}/sign/up">Sign up</a> to register a new account</li>
					<li><a href="https://migrate.radio4000.com">Migrate</a> a channel from v1 to v2</li>
				</ul>
			</section>
		`
	}
	renderAppearance() {
		return html`
			<section>
				<h2>Appearance</h2>
				<p>Customize the application's look and feel.</p>
				<r4-user-account .account=${this.store.userAccount}></r4-user-account>
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

	createRenderRoot() {
		return this
	}
}
