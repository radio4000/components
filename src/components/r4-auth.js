import { html, render } from 'lit'
import { Component } from 'wchooks'
import { signUp, signIn, signOut } from '@radio4000/sdk'

const R4SignUp = () => {
	async function handleSignUp(event) {
		event.preventDefault()
		const fd = new FormData(event.target)
		const { data, error } = await signUp({ email: fd.get('email'), password: fd.get('password') })
		console.log(data, error)
	}
	return html`
		<form @submit=${handleSignUp}>
			<input name="email" type="email" required value="oskar@rough.dk" />
			<input name="password" type="password" required />
			<button type="submit">Sign Up</button>
		</form>
	`
}

const R4SignIn = () => {
	async function handleSignIn(event) {
		event.preventDefault()
		const fd = new FormData(event.target)
		const { data, error } = await signIn({ email: fd.get('email'), password: fd.get('password') })
		console.log(data, error)
	}
	return html`
		<form @submit=${handleSignIn}>
			<input name="email" type="email" required value="oskar@rough.dk" />
			<input name="password" type="password" required />
			<button type="submit">Sign In</button>
		</form>
	`
}

const R4SignOut = () => {
	return html`
		<button type="button" @click=${() => signOut()}>Sign Out</button>
	`
}

customElements.define('r4-sign-up', Component(R4SignUp, render))
customElements.define('r4-sign-in', Component(R4SignIn, render))
customElements.define('r4-sign-out', Component(R4SignOut, render))
