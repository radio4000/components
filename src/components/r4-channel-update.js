import sdk from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="id" required>ID</label>
			<input name="id" type="text"/>
		</fieldset>
		<fieldset>
			<label for="name">Name</label>
			<input name="name" type="text"/>
		</fieldset>
		<fieldset>
			<label for="slug">Slug</label>
			<input name="slug" type="text" required/>
		</fieldset>
		<fieldset>
			<label for="description">Description</label>
			<textarea name="description"></textarea>
		</fieldset>
	</slot>
`


export default class R4ChannelUpdate extends R4Form {
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
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		this.disableForm()

		const channelId = this.state.id
		const changes = { ...this.state }
		delete changes.id

		let res
		try {
			res = await sdk.updateChannel(channelId, changes)
			if (res.error) {
				if (res.status === 404) {
					res.error.code = 404
				}
				this.handleError(res.error)
			}
		} catch (error) {
			this.handleError(error)
		}
		this.enableForm()
		if (res && res.data) {
			this.resetForm()
		}
	}
}
