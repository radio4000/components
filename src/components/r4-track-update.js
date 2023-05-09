import {sdk} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id">ID</label>
			<input name="id" type="text" required/>
		</fieldset>
		<fieldset>
			<label for="url">URL</label>
			<input name="url" type="url"/>
		</fieldset>
		<fieldset>
			<label for="title">Title</label>
			<input name="title" type="text" required/>
		</fieldset>
		<fieldset>
			<label for="discogs_url">Discogs URL</label>
			<input name="discogs_url" type="url"/>
		</fieldset>
		<fieldset>
			<label for="description">Description</label>
			<textarea name="description"></textarea>
		</fieldset>
	</slot>
`

export default class R4TrackUpdate extends R4Form {
	submitText = 'Update track'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		'default': {
			message: 'Unhandled error',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		const {id, url, title, description, discogs_url} = this.state
		let res = {}
		let error = null
		try {
			res = await sdk.tracks.updateTrack(id, {url, title, description, discogs_url})
			if (res.error) {
				error = res.error
				throw error
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()
		// if (data) {
		// 	this.resetForm()
		// }
		super.handleSubmit(res)
	}
}
