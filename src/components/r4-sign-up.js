import { html } from 'lit'
import { signUp } from '@radio4000/sdk'

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

export default R4SignUp