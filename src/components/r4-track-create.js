import sdk from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="channel_id">Channel ID</label>
			<input name="channel_id" type="text" required/>
		</fieldset>
		<fieldset>
			<label for="url">URL</label>
			<input name="url" type="url" required />
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

	connectedCallback() {
		super.connectedCallback()
		/* hide the channel id if it is there */
		const $channelId = this.querySelector('[name="channel_id"]')
		if ($channelId.value) {
			$channelId.parentElement.setAttribute('hidden', 'true')
		}
	}

	async handleInput(event) {
		const { name, value } = event.target
		super.handleInput(event)

		/* if the `url` change, and there is no `title`, set one up */
		if (name === 'url') {
			const data = sdk.providers.mediaUrlParser(value)
			console.log('url changed', data)
			if (!this.state.title) {
				console.info('(should) fetching track title', data)
				const $trackTitle = this.querySelector('[name="title"]')
				$trackTitle.value = `${data.provider}@${data.id}`
			}
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		let res = {},
				error = null
		try {
			res = await sdk.createTrack(this.state.channel_id, {
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
