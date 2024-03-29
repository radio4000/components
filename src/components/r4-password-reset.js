import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<legend for="email">Email</legend>
			<input type="email" autocomplete="username" name="email" required placeholder="email@example.org"/>
		</fieldset>
	</slot>
`

export default class R4PasswordReset extends R4Form {
	submitText = 'Send reset password (magic) link'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
			message: 'Unhandled error',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()

		let res = {}
		let error = null

		try {
			/* {redirectTo: '/settings'} */
			res = await sdk.supabase.auth.signInWithOtp({
				email: this.state.email,
				options: {
					emailRedirectTo: window.location.href,
				},
			})
			if (res.error) {
				console.log('Error reseting password', res)
				throw res.error
			}
		} catch (error) {
			console.info('Error password', error, error.message)
			if (error.message.includes('placeholder')) {
				error.code = 'wrong-pattern'
			}
			this.handleError(error)
		}

		this.enableForm()

		const {data} = res
		if (!data?.error) {
			this.resetForm()
		}

		console.log(res)

		super.handleSubmit({
			error,
			data,
		})
	}
}
