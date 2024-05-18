import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<legend>
					<label for="password">
						Update password
					</label>
			</legend>
			<input type="password" name="password" required autocomplete="new-password" placeholder="*new*unique*password*"/>
		</fieldset>
	</slot>
`

export default class R4PasswordUpdate extends R4Form {
	submitText = 'Update password'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
			message: 'Unhandled error',
		},
		'new-password-different': {
			message: 'New password should be different from the old password',
		},
		'password-too-short': {
			message: 'New password should be at least 6 characters',
		},
		'wrong-pattern': {
			message: 'Error during password storage. Password seems too complex (maybe too long or the characters used)',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()

		let res = {}
		let error = null

		try {
			res = await sdk.supabase.auth.updateUser({
				password: this.state.password,
			})
			if (res.error) {
				throw res.error
			}
		} catch (error) {
			/* console.info("Error updating password", error, error.message) */
			if (error.message.includes('Error during password storage')) {
				error.code = 'wrong-pattern'
			}
			if (error.message.includes('Password should be at least')) {
				error.code = 'password-too-short'
			}
			if (error.message.includes('New password should be different from')) {
				error.code = 'new-password-different'
			}
			this.handleError(error)
		}

		this.enableForm()

		const {data} = res
		if (data?.user) {
			this.resetForm()
		}

		super.handleSubmit({
			error,
			data,
		})
	}
}
