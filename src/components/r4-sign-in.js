import {signIn} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">email</label>
			<input name="email" type="email" autocomplete="username" required/>
		</fieldset>
		<fieldset>
			<label for="password">password</label>
			<input name="password" type="password" autocomplete="current-password" required />
		</fieldset>
	</slot>
`

export default class R4SignIn extends R4Form {
	submitText = 'Sign in'
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
			message: 'Email must be confirmed to login'
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
			res = await signIn({
				email: this.state.email,
				password: this.state.password,
			})
			if (res.error) {
				console.log(res)
				if (res.error.message === 'Email not confirmed') {
					res.error.code = 'email-not-confirmed'
				}
				if (res.error.message === 'Invalid login credentials') {
					res.error.code = 'invalid-login-credentials'
				}
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()

		const { data } = res
		if (data && data.user && data.session) {
			this.resetForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
