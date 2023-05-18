import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

export default class R4ResetPassword extends LitElement {
	static properties = {
		email: {type: String, reflect: true},
		msg: {type: String, state: true},
		loading: {type: Boolean, state: true}
	}

	async submit(event) {
		event.preventDefault()
		this.loading = true
		const email = event.target.email.value
		if (!email) return
		const {error} = await sdk.supabase.auth.resetPasswordForEmail(email, {redirectTo: '/settings'})
		if (error) console.log(error)
		this.msg = error ? error.message : 'Check your email to continue resetting your password'
		this.loading = false
	}

	render() {
		return html`
			<form @submit=${this.submit}>
				<label>Email <input type="email" name="email" value=${this.email} autocomplete="username" required></label>
				<button type="submit" ?disabled=${this.loading}>${this.loading ? 'Sending...' : 'Send password reset email'}</button>
				${this.msg ? html`<p>${this.msg}</p>` : null}
			</form>
		`
	}

	createRenderRoot() {
		return this
	}
}

