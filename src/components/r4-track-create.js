import {sdk} from '@radio4000/sdk'
import R4Form from './r4-form.js'

const fieldsTemplate = document.createElement('template')
fieldsTemplate.innerHTML = `
	<slot name="fields">
		<fieldset>
			<label for="channel_id">Channel ID</label>
			<input name="channel_id" type="text" required readonly/>
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
	static get observedAttributes () {
		return ['channel-id', 'url', 'title']
	}

	submitText = 'Create track'

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

	attributeChangedCallback(attrName) {
		super.attributeChangedCallback(...arguments)
		const $channelId = this.querySelector('[name="channel_id"]')
		if ($channelId.value) {
			$channelId.parentElement.setAttribute('hidden', 'true')
		}
	}

	async handleInput(event) {
		const { name, value } = event.target
		super.handleInput(event)

		/* if the `url` change, and there is no `title`, set one up */
		if (name === 'url' && value) {
			if (!this.state.title) {
				const { title } = await this.fetchTrackInfo(value)
				if (title) {
					/* cannot this.setAttribute('title') from here */
					const $trackTitle = this.querySelector('[name="title"]')
					$trackTitle.value = title
					$trackTitle.dispatchEvent(new Event('input')) // trigger value change
				}
			}
		}
	}

	async fetchTrackInfo(mediaUrl) {
		let trackInfo = {}
		const data = mediaUrlParser(mediaUrl)
		if (data.provider === 'youtube' && data.id) {
			let res
			try {
				res = await fetch(`https://api.radio4000.com/api/youtube?id=${data.id}`)
				trackInfo = await res.json()
			} catch (error) {
			}
			console.log('API trackInfo', trackInfo)
		}
		return trackInfo
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()

		this.disableForm()
		let res = {},
				error = null
		try {
			res = await createTrack(this.state.channel_id, {
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
