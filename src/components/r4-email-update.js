import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="email">Change email</label>
			<input type="email" autocomplete="username" name="email" required />
		</fieldset>
	</slot>
`

export default class R4EmailUpdate extends R4Form {
	submitText = 'Update email'

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
			res = await sdk.supabase.auth.updateUser({
				email: this.state.email,
			})
			if (res.error) {
				console.log('Error updating email', res)
				throw res.error
			}
		} catch (error) {
			console.info('Error updating email', error, error.message)
			if (error.message.includes('placeholder')) {
				error.code = 'wrong-pattern'
			}
			this.handleError(error)
		}

		this.enableForm()

		const {data} = res
		if (data?.user) {
			this.resetForm()
		}

		console.log(res)

		super.handleSubmit({
			error,
			data,
		})
	}
}
