import {updateChannel} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id" required>ID</label>
			<input name="id" type="text" readonly/>
		</fieldset>
		<fieldset>
			<label for="name">Name</label>
			<input name="name" type="text"/>
		</fieldset>
		<fieldset>
			<label for="slug">Slug</label>
			<input name="slug" type="text" required minlength="3" />
		</fieldset>
		<fieldset>
			<label for="description">Description</label>
			<textarea name="description"></textarea>
		</fieldset>
		<fieldset>
			<label for="url">URL</label>
			<input name="url" type="url"/>
		</fieldset>
		<fieldset>
			<label for="longitude">Longitude</label>
			<input name="longitude" type="number" />
		</fieldset>
		<fieldset>
			<label for="latitude">Latitude</label>
			<input name="latitude" type="number" />
		</fieldset>
	</slot>
`

export default class R4ChannelUpdate extends R4Form {
	static get observedAttributes() {
		return ['id', 'name', 'slug', 'description', 'url', 'longitude', 'latitude']
	}

	submitText = 'Update channel'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		'default': {
			message: 'Unhandled error',
		},
		'22P02': {
			message: 'invalid input syntax for type uuid',
			field: 'id',
		},
		23514: {
			message: 'The slug needs to be between 5 and 40 characters',
			field: 'slug',
		},
		23505: {
			message: 'The slug needs to be unique amond all channels',
			field: 'slug',
		},
		404: {
			message: 'This channel does not exist',
			field: 'id',
		},
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

		const channelId = this.state.id
		const changes = { ...this.state }
		delete changes.id

		let res = {}
		let	error = null

		try {
			res = await updateChannel(channelId, changes)
			if (res.error) {
				if (res.status === 404) {
					res.error.code = 404
				}
				error = res.error
				this.handleError(error)
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()

		super.handleSubmit({error, data: changes})
	}
}
