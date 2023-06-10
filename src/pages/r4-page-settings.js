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
		if (email === this.store.user.email)  return
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
		return html`
			<h1>Settings</h1>

			<h2>Account</h2>
			<p>
				You are signed in as <em>${this.store?.user?.email}</em>.
			</p>
			<br/>
			<form @submit=${this.changeEmail}>
				<label
					>Change email<br />
					<input type="email" name="email" value=${this.store.user?.email} required />
				</label>
				<button type="submit">Save</button>
				${this.changeEmail.msg ? html`<p>${this.changeEmail.msg}</p>` : null}
			</form>
			<br/>
			<form @submit=${this.changePassword}>
				<input name="username" value=${this.store.user?.email} readonly hidden autocomplete="username" />
				<label
					>Change password<br />
					<input type="password" name="password" required autocomplete="new-password" />
				</label>
				<button type="submit">Save</button>
				${this.changePassword.msg ? html`<p>${this.changePassword.msg}</p>` : null}
			</form>

			<h2>Appearance</h2>
			<r4-color-scheme .user=${this.store.user}></r4-color-scheme>

			<h2>Danger zone</h2>
			<r4-user-delete
				.user=${this.store.user}
				.userChannels=${this.store.userChannels}
				.href=${this.config.href}
			></r4-user-delete>

			<p>
				<a href="${this.config.href}/sign/out">Sign out</a>
			</p>
		`
	}

	createRenderRoot() {
		return this
	}
}
