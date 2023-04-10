import { LitElement, html } from 'lit'
import sdk from '@radio4000/sdk'
// import page from 'page/page.mjs'

export default class R4PageSettings extends LitElement {
	static properties = {
		/* props */
		store: { type: Object, state: true },
		query: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	async changeEmail(event) {
		event.preventDefault()
		const email = event.target.email.value
		if (email === this.store.user.email) {
			console.log('nothing to update')
			return
		}
		const { error } = await sdk.supabase.auth.updateUser({email})
		this.changeEmail.msg = error ? 'Could not update your email' : 'Please confirm the link sent to both your new and old email'
		if (error) {
			console.log(error)
		}
	}

	async changePassword(event) {
		event.preventDefault()
		const password = event.target.password.value
		const { data, error } = await sdk.supabase.auth.updateUser({password})
		this.changePassword.msg = error ? 'Could not update password' : 'Password updated!'
		if (error) {
			console.log('error changing password', error)
		}
	}

	async confirmAndDelete(event) {
		event.preventDefault()
		if (!window.confirm('Do you really want to delete your account?')) return
		// const {error} = await sdk.users.deleteUser()
		const {error} = await sdk.users.readUser()
		if (!error) {
			console.log('deleted user')
		}
		console.log('deleted user?', error)
	}

	render() {
		return html`
			<h1>Settings</h1>

			<p>
				You are signed in as:<br />
				<em>${this.store?.user?.email}</em>
			</p>

			<h2>Change e-mail</h2>
			<form @submit=${this.changeEmail}>
				<label>E-mail
					<input type="email" name="email" value=${this.store.user?.email} required>
				</label>
				<button type="submit">Update my e-mail</button>
				${this.changeEmail.msg ? html`<p>${this.changeEmail.msg}</p>` : null}
			</form>

			<br/>

			<h2>Change password</h2>
			<form @submit=${this.changePassword}>
				<input name="username" value=${this.store.user.email} readonly hidden autocomplete="username">
				<label>Enter a new password
					<input type="password" name="password" required autocomplete="new-password">
				</label>
				<button type="submit">Set new password</button>
				${this.changePassword.msg ? html`<p>${this.changePassword.msg}</p>` : null}
			</form>

			<br/>

			<h2>Delete account</h2>
			<form @submit=${this.confirmAndDelete}>
				<button type="submit">Delete my account</button>
			</form>
		`
	}

	createRenderRoot() {
		return this
	}
}
