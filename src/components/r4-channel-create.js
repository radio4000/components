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

	async connectedCallback() {
		super.connectedCallback()
	}

	render() {
		super.render()
	}

	async handleSubmit(event) {
		event.preventDefault()
		/* super.handleSubmit(event) */
		const {
			data: user,
			erro: userError,
		} = await sdk.supabase.auth.getUser()

		if (userError) {
			return this.handleError(userError)
		}

		console.log('channel-create:submit:user', user)
		const channel = this.state
		const res = await sdk.createChannel({
			channel,
			user,
		})
		console.log('channel-create:submit:res', res)
		const { error } = res
		if (error) {
			return this.handleError(error)
		}
	}

	errors = {
		23514: {
			message: 'The slug needs to be between 5 and 40 characters',
			field: 'slug',
		},
		23515: {
			message: 'duplicate key value violates unique constraint "channels_slug_key"',
			field: 'slug',
		}
	}

	/* serialize errors */
	handleError(error) {
		const {
			message = 'Error submitting the form',
			field
		} = this.errors[error.code]

		error.field = field
		error.message = message
		super.handleError(error)
	}
}
