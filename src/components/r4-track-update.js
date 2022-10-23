import sdk from '@radio4000/sdk'
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
			<label for="description">Description</label>
			<textarea name="description"></textarea>
		</fieldset>
	</slot>
`

export default class R4TrackCreate extends R4Form {
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
		let res = {},
				error = null
		try {
			res = await sdk.createTrack(this.state.id, {
				url: this.state.url,
				title: this.state.title,
				description: this.state.description,
			})
			if (res.error) {
				error = res
				throw error
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()

		const { data } = res
		if (data) {
			this.resetForm()
		}
		super.handleSubmit({
			error,
			data,
		})
	}
}
