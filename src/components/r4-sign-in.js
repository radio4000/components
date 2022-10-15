import { html } from 'lit'
import sdk from '@radio4000/sdk'

const R4SignIn = () => {
	async function handleSignIn(event) {
		event.preventDefault()
		const fd = new FormData(event.target)
		const { data, error } = await sdk.signIn({ email: fd.get('email'), password: fd.get('password') })
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

export default R4SignIn
