import sdk from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id">ID</label>
			<input name="id" type="text"/>
		</fieldset>
		<fieldset>
			<label for="confirmation">Confirmation</label>
			<input name="confirmation" type="checkbox"/>
		</fieldset>
	</slot>
`


export default class R4ChannelCreate extends R4Form {
	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		'default': {
			message: 'Unhandled error',
			field: null,
		},
		'confirmation': {
			message: 'Please confirm deletion',
			field: 'confirmation',
		},
		23503: {
			message: 'You appear to want to delete a channel that still has some tracks. Delete all tracks first?',
			field: 'id',
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		this.disableForm()

		const { id, confirmation } = this.state
		if (!confirmation) {
			this.handleError({
				code: 'confirmation',
			})
		}

		let res
		try {
			res = await sdk.deleteChannel(id)
			if (res && res.error) {
				throw res.error
			}
		} catch (error) {
			this.enableForm()
			return this.handleError(error)
		}

		/* sucess deleting */
		if (res.status === 204) {
			this.resetForm()
		}
	}
}