import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id">ID</label>
			<input name="id" type="text" required disabled/>
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
			<label for="description">Description</label>
			<textarea name="description"></textarea>
		</fieldset>
		<fieldset>
			<label for="discogsUrl">Discogs URL</label>
			<input name="discogsUrl" type="url" placeholder="Discogs release URL"/>
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
		default: {
			message: 'Unhandled error',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		const {id, url, title, description, discogsUrl} = this.state
		let res = {}
		let error = null
		try {
			res = await sdk.tracks.updateTrack(id, {url, title, description, discogs_url: discogsUrl})
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
