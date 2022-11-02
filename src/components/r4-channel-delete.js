import {deleteChannel} from '@radio4000/sdk'
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
			<input name="confirmation" type="checkbox" required/>
		</fieldset>
	</slot>
`


export default class R4ChannelDelete extends R4Form {
	static get observedAttributes() {
		return ['']
	}
	submitText = 'Delete channel'
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
			message: 'You appear to want to delete a channel that still has some tracks. Delete all tracks first.',
		}
	}

	connectedCallback() {
		super.connectedCallback()
		/* hide the channel id if it is there */
		const $channelId = this.querySelector('[name="id"]')
		if ($channelId.value) {
			$channelId.parentElement.setAttribute('hidden', 'true')
		}
	}

	async handleSubmit(event) {
		event.stopPropagation()
		event.preventDefault()
		this.disableForm()

		const { id, confirmation } = this.state
		if (!confirmation) {
			this.enableForm()
			return this.handleError({
				code: 'confirmation',
			})
		}

		let res
		try {
			res = await deleteChannel(id)
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
			this.enableForm()
		}

		super.handleSubmit(res)
	}
}
