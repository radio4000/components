import {readUser, signOut} from '@radio4000/sdk'
import R4Form from './r4-form.js'

export default class R4SignOut extends R4Form {
	submitText = 'Sign out'
	errors = {
		'default': {
			message: 'Unhandled error',
		},
		'not-signed-in': {
			message: 'Not currently signed in a user'
		}
	}

	async connectedCallback() {
		super.connectedCallback()
		const { data: user } = await readUser()
		if (!user) {
			this.disableForm()
			this.handleError({
				code: 'not-signed-in'
			})
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		let res = {},
			error = null
		try {
			res = await signOut()
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
