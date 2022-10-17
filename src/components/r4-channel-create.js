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
		'slug-taken': {
			message: 'This slug is already in use by an other channel',
			field: 'slug',
		},
		23514: {
			message: 'The slug needs to be between 5 and 40 characters',
			field: 'slug',
		},
		23505: {
			message: 'The slug needs to be unique amond all channels',
			field: 'slug',
		},
	}

	async handleSubmit(event) {
		event.preventDefault()
		this.disableForm()
		const {
			data: {
				user,
			},
			error: userError,
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
			if (
				error.message === 'Sorry. This channel slug is already taken by someone else.'
			) {
				/* todo: fixme: sdk malformed error, no {code, message},
					 maybe pass the supabase error directly */
				this.handleError({
					code: 'slug-taken',
					message: error.message,
				})
			} else {
				/* handle known errors */
				this.handleError(error)
			}
		}
		this.enableForm()
		if (res && res.data) {
			console.log('res.data', data)
			this.resetForm()
		}
	}
}
