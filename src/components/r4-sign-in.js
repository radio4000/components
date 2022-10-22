import sdk from '@radio4000/sdk'
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


export default class R4SignIn extends R4Form {
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
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		let res = {},
				error = null
		try {
			res = await sdk.signIn({
				email: this.state.email,
				password: this.state.password,
			})
			if (res.error) {
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
