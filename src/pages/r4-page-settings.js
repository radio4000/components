import { LitElement, html } from 'lit'
import sdk from '@radio4000/sdk/src/default.js'
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
		if (!window.confirm('Are you certain? Your account, channels and tracks will be deleted. We can not recover them.')) return
		const {error} = await sdk.users.deleteUser()
		if (!error) {
			console.log('deleted user account')
			await sdk.auth.signOut()
			window.location.reload()
		} else {
			console.log('Error deleting user account', error)
		}
	}

	render() {
		return html`
			<h1>Settings</h1>

			<p>
				You are signed in as:<br />
				<em>${this.store?.user?.email}</em>
			</p>

			<form @submit=${this.changeEmail}>
				<label>Change email<br/>
					<input type="email" name="email" value=${this.store.user?.email} required>
				</label>
				<button type="submit">Save</button>
				${this.changeEmail.msg ? html`<p>${this.changeEmail.msg}</p>` : null}
			</form>

			<br/>

			<form @submit=${this.changePassword}>
				<input name="username" value=${this.store.user?.email} readonly hidden autocomplete="username">
				<label>Change password<br/>
					<input type="password" name="password" required autocomplete="new-password">
				</label>
				<button type="submit">Save</button>
				${this.changePassword.msg ? html`<p>${this.changePassword.msg}</p>` : null}
			</form>

			<br/>

			<h2>Delete account</h2>
			<p>Deleting your account will also delete these radios including any tracks.</p>
			<ul>
				${this.store?.userChannels?.length ?
						this.store.userChannels.map((c) => html`<li>${c.name}</li>`) : null}
			</ul>
			<details>
				<summary>I understand, continue</summary>
				<form @submit=${this.confirmAndDelete}>
					<button type="submit">Delete my account</button>
				</form>
			</details>
		`
	}

	createRenderRoot() {
		return this
	}
}
