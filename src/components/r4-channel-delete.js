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
			res = await sdk.deleteChannel({
				id
			})
			if (res.error) {
				this.handleError(res.error)
			}
		} catch (error) {
			this.handleError(error)
		}
		this.enableForm()
		if (res && res.data) {
			console.log('res.data', data)
		}
		this.resetForm()
	}
}
