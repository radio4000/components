import {sdk} from '../libs/sdk.js'
import R4Form from './r4-form.js'
import slugify from '../libs/slugify.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="name">Name</label>
			<input name="name" type="text" required placeholder="Ex: my new radio" />
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

	connectedCallback() {
		super.connectedCallback()
		this.querySelector('input[name="name"]').addEventListener('input', this.setSlugOnNameChange.bind(this))
	}

	setSlugOnNameChange(event) {
		const slug = slugify(event.target.value)
		const input = this.querySelector('input[name="slug"]')
		input.value = slug
		// Manually update state since it's not caught by r4-form.
		this.state.slug = slug
	}

	errors = {
		default: {
			message: 'Unhandled error',
		},
		'slug-exists-firebase': {
			message: 'This slug is already in use by an other channel',
			field: 'slug',
		},
		23502: {
			message: 'Fill out the slug field',
			field: 'slug'
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
			message: 'Sign in to create a channel',
			field: 'slug',
		},
		'sign-in': {
			message: 'You need to sign in to create a radio channel',
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
