import {sdk} from '../libs/sdk.js'
import {fetchOEmbed} from '../libs/oembed.js'
import {parseUrl as parseDiscogsUrl, buildSearchUrl} from '../libs/discogs.js'
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
			<input name="url" type="url" required placeholder="Link to the media (youtube, soundcloud, vimeo, file…)" title="Add the address to a media (youtube, soundcloud, vimeo etc.)"/>
		</fieldset>
		<fieldset>
			<label for="title" title="After pasting a URL the title will write itself">Title</label>
			<input name="title" type="text" required placeholder="Artist Name - Track Name"/>
		</fieldset>
		<fieldset>
			<label for="description" title="Optionally give your track a description">Description</label>
			<textarea name="description" placeholder="Fantastic track #fantastic"></textarea>
		</fieldset>
		<fieldset>
			<label for="discogs_url" title="Add the Discogs release URL related to the track. Eg: https://www.discogs.com/Jennifer-Lara-I-Am-In-Love/master/541751">Discogs URL</label>
			<input name="discogs_url" type="url" placeholder="URL to a Discogs release" />
			<r4-discogs-resource url=""></r4-discogs-resource>
		</fieldset>
	</slot>
`

const addTagsToDescription = (description = '', tags = []) => {
	const tagsText = tags.map((tag) => `#${tag}`).join(' ')
	return [description, tagsText].join(' ').trim()
}

export default class R4TrackCreate extends R4Form {
	static get observedAttributes() {
		return ['channel_id', 'url', 'title']
	}

	submitText = 'Add track'

	constructor() {
		super()
		this.fieldsTemplate = fieldsTemplate
	}

	errors = {
		default: {
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

	attributeChangedCallback() {
		super.attributeChangedCallback(...arguments)
		const $channelId = this.querySelector('[name="channel_id"]')
		if ($channelId.value) {
			$channelId.parentElement.setAttribute('hidden', 'true')
		}
	}

	async handleInput(event) {
		const {name, value} = event.target
		super.handleInput(event)

		/* if the `url` change, and there is no `title`, set one up */
		if (name === 'url' && value) {
			if (!this.state.title) {
				const {title} = await fetchOEmbed(value)
				if (title) {
					this.state = {...this.state, title}
					const $trackTitle = this.querySelector('[name="title"]')
					$trackTitle.value = title
				}
			}
		}
		if (name === 'title' && value) {
			const search = buildSearchUrl(value)
			console.log('search url', search)
		}
		if (name === 'discogs_url') {
			const $discogs = this.querySelector('r4-discogs-resource')
			if (value) {
				const discogsInfo = parseDiscogsUrl(value)
				if (discogsInfo.id && discogsInfo.type) {
					$discogs.setAttribute('url', value)
					$discogs.setAttribute('suggestions', 'true')
					$discogs.addEventListener('suggestion', this.handleDiscogsSuggestion.bind(this))
				}
			} else {
				$discogs.removeAttribute('url')
			}
		}
	}

	async handleSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		this.disableForm()
		let res = {}
		let error = null
		const {channel_id, url, title, description, discogs_url, discogs_tags} = this.state

		const fullDesc = addTagsToDescription(description, discogs_tags)

		try {
			res = await sdk.tracks.createTrack(channel_id, {
				url,
				title,
				discogs_url,
				description: fullDesc,
			})
			if (res.error) {
				error = res
				throw error
			}
		} catch (err) {
			this.handleError(err)
		}
		this.enableForm()

		const {data} = res
		if (data) {
			this.resetForm()
		}
		super.handleSubmit({
			error,
			data,
		})
	}
	handleDiscogsSuggestion(event) {
		this.state = {
			...this.state,
			discogs_tags: event.detail,
		}
	}
}
