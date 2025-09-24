import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id">ID</label>
			<input name="id" type="text"/>
		</fieldset>
	</slot>
`

/**
 * Form for deleting a track
 */
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

		const {id} = this.state

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
