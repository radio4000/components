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
		this.disableForm()
		const {
			data: user,
			erro: userError,
		} = await sdk.supabase.auth.getUser()

		if (userError || !user) {
			return this.handleError(userError)
		}

		const channel = this.state
		let res
		try {
			res = await sdk.createChannel({
				channel,
				user,
			})
			if (res.error) {
				this.handleError(res.error)
			}
		} catch (error) {
			/* todo: fixme: sdk error (not-an-error), but it worked? */
			if (
				error.message === "can't access property \"id\", a3.data is null"
			) {} else {
				this.handleError(error)
			}
		}
		this.enableForm()
		if (res && res.data) {
			console.log('res.data', data)
		}
		this.resetForm()
	}

	errors = {
		default : {
			message: 'Unhandled error',
		},
		23514: {
			message: 'The slug needs to be between 5 and 40 characters',
			field: 'slug',
		},
		23505: {
			message: 'The slug needs to be unique amond all channels',
			field: 'slug',
		}
	}

	/* serialize errors */
	handleError(error) {
		const { code = 'default' } = error
		const {
			message = 'Error submitting the form',
			field
		} = this.errors[code]

		error.field = field
		error.message = message
		super.handleError(error)
	}
}
