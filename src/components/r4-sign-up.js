import {sdk} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">Email</label>
			<input name="email" type="email" required autocomplete="email" />
		</fieldset>
		<fieldset>
			<label for="password">Password</label>
			<input name="password" type="password" required autocomplete="new-password" />
		</fieldset>
	</slot>
`

export default class R4SignUp extends R4Form {
	submitText = 'Sign up'
	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
			message: 'Unhandled error',
		},
		'email-not-confirmed': {
			field: 'email',
			message: "You're signed up, confirm your email to login ",
		},
		'invalid-login-credentials': {
			field: 'email',
			message: 'The email & password combination is incorrect',
		},
		'email-rate-limit': {
			message: 'Rate limit exceeded. Wait five minutes before trying again',
		},
		'password-too-short': {
			field: 'password',
			message: 'Password should be at least 6 characters',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()

		let res = {}
		let error = null

		try {
			res = await sdk.auth.signUp({
				email: this.state.email,
				password: this.state.password,
			})
			console.log('sign up res', res)
			if (res.error) {
				console.log('Error signing up', res)
				if (res.error.message.startsWith('For security purposes, you can only request this after')) {
					res.error.code = 'email-not-confirmed'
				}
				if (res.error.stack.includes('Email rate limit exceeded')) {
					res.error.code = 'email-rate-limit'
				}
				if (res.error.stack.includes('Password should be at least 6 characters')) {
					res.error.code = 'password-too-short'
				}
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		}

		const {data} = res
		if (data?.user?.id) {
			this.resetForm()
		} else {
			this.enableForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
