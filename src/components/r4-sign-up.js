import {signUp} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">email</label>
			<input name="email" type="email" required/>
		</fieldset>
		<fieldset>
			<label for="password">password</label>
			<input name="password" type="password" required />
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
		'default': {
			message: 'Unhandled error',
		},
		'email-not-confirmed': {
			field: 'email',
			message: 'You\'re signed up, confirm your email to login '
		},
		'invalid-login-credentials': {
			field: 'email',
			message: 'The Email & Password combination is incorect',
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		let res = {},
			error = null
		try {
			res = await signUp({
				email: this.state.email,
				password: this.state.password,
			})
			if (res.error) {
				console.log(res)
				if (res.error.message.startsWith('For security purposes, you can only request this after')) {
					res.error.code = 'email-not-confirmed'
				}
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		}

		const { data } = res
		if (data && data.user && data.user.id) {
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
