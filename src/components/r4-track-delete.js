import {sdk} from '@radio4000/sdk'
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

export default class R4TrackDelete extends R4Form {
	submitText = 'Delete track'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
			message: 'Unhandled error',
			field: null,
		},
		confirmation: {
			message: 'Really sure to delete this track?',
			field: 'confirmation',
		},
	}

	connectedCallback() {
		super.connectedCallback()
		/* hide the track ID fieldset, if the ID is there */
		const $trackId = this.querySelector('[name="id"]')
		if ($trackId.value) {
			$trackId.parentElement.setAttribute('hidden', 'true')
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()

		const {id, confirmation} = this.state

		if (!confirmation) {
			this.enableForm()
			return this.handleError({
				code: 'confirmation',
			})
		}

		let res
		try {
			res = await sdk.tracks.deleteTrack(id)
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
