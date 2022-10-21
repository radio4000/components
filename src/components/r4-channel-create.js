import sdk from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="name">Name</label>
			<input name="name" type="text"/>
		</fieldset>
		<fieldset>
			<label for="slug">Slug</label>
			<input name="slug" type="text" required/>
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
		},
		'slug-exists-firebase': {
			message: 'This slug is already in use by an other channel',
			field: 'slug',
		},
		23514: {
			message: 'The slug needs to be between 3 and 40 characters',
			field: 'slug',
		},
		23505: {
			message: 'The slug is already in use by an other channel',
			field: 'slug',
		},
		42501: {
			message: 'Signin to create a channel',
			field: 'slug',
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		this.disableForm()
		const channel = this.state
		let res
		try {
			res = await sdk.createChannel({
				name: channel.name,
				slug: channel.slug,
			})
			if (res.error) {
				console.log(res.error)
				throw res
			}
		} catch (error) {
			this.handleError(error)
		}

		this.enableForm()
		if (res && res.data) {
			console.log('res.data', res.data)
			this.resetForm()
		}
	}
}
