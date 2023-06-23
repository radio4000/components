import {sdk} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="name">Name</label>
			<input name="name" type="text" required />
		</fieldset>
		<fieldset>
			<label for="slug">Slug</label>
			<input name="slug" type="text" required/>
		</fieldset>
	</slot>
`

export default class R4ChannelCreate extends R4Form {
	submitText = 'Create channel'
	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
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
			message: 'Sign-in to create a channel',
			field: 'slug',
		},
		'sign-in': {
			message: 'You need to sign-in to create a radio channel',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		const channel = this.state
		let res = {}
		try {
			const {data: user} = await sdk.users.readUser()
			if (!user) {
				throw {code: 'sign-in'}
			}
			res = await sdk.channels.createChannel({
				name: channel.name,
				slug: channel.slug,
				userId: user.id,
			})
			if (res.error) {
				throw res.error
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()

		const {data} = res
		if (data) {
			this.resetForm()
		}
		super.handleSubmit(res)
	}
}
