import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'
// import page from 'page/page.mjs'

export default class R4PageSettings extends LitElement {
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
		const email = event.target.email.value
		if (email === this.store.user.email) return
		const {error} = await sdk.supabase.auth.updateUser({email})
		this.changeEmail.msg = error
			? 'Could not update your email'
			: 'Please confirm the link sent to both your new and old email'
		if (error) {
			console.log(error)
		}
	}

	async changePassword(event) {
		event.preventDefault()
		const password = event.target.password.value
		const {error} = await sdk.supabase.auth.updateUser({password})
		this.changePassword.msg = error ? 'Could not update password' : 'Password updated!'
		if (error) {
			console.log('error changing password', error)
		}
	}

	render() {
		const {user} = this.store
		return html`
			<r4-page-header>
				<h1>Settings</h1>
				<p>Application configuration and user settings.</p>
			</r4-page-header>
			<r4-page-main>${this.renderAppearance()} ${user ? this.renderUser() : this.renderNoUser()}</r4-page-main>
		`
	}

	renderUser() {
		return html`
			<section>
				<h2>Account</h2>
				<p>
					You are signed in as <em>${this.store?.user?.email}</em>;
					<a href="${this.config.href}/sign/out">sign out</a>
				</p>
				<form @submit=${this.changeEmail}>
					<fieldset>
						<label for="email">Change email</label>
						<input type="email" name="email" value=${this.store.user?.email} required />
					</fieldset>
					<fieldset>
						<button type="submit">Save</button>
					</fieldset>
					<output>${this.changeEmail.msg ? html`<p>${this.changeEmail.msg}</p>` : null}</output>
				</form>
				<form @submit=${this.changePassword}>
					<fieldset hidden>
						<input name="username" value=${this.store.user?.email} readonly hidden autocomplete="username" />
					</fieldset>
					<fieldset>
						<label for="password">Change password</label>
						<input type="password" name="password" required autocomplete="new-password" />
					</fieldset>
					<fieldset>
						<button type="submit">Save</button>
					</fieldset>
					<output> ${this.changePassword.msg ? html`<p>${this.changePassword.msg}</p>` : null} </output>
				</form>
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
				<p>
					Your are signed out.
					<a href="${this.config.href}/sign/in">Sign in</a> to an existing user account, or
					<a href="${this.config.href}/sign/up">sign up</a> for a new one.
				</p>
			</section>
		`
	}
	renderAppearance() {
		return html`
			<section>
				<h2>Appearance</h2>
				<r4-color-scheme .user=${this.store.user}></r4-color-scheme>
			</section>
		`
	}

	createRenderRoot() {
		return this
	}
}
