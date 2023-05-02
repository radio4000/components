import {sdk} from '@radio4000/sdk'

export default class R4Channel extends HTMLElement {
	static get observedAttributes() {
		return ['origin', 'id', 'slug', 'channel']
	}

	/* Used to make a link to the channel's homepage.
		 It could point to different URL schemes:
		 - on root: https://radio.example.org/
		 - on subpage: https://music.example.org/test-radio-2
		 - in query parameter: https://example.org/?radio=test-radio-4
		 To handle all case, we replace the `{{slug}}` token in the string
	 */
	get origin() {
		const url = this.getAttribute('origin')
		if (typeof url === 'string') {
			if (this.channel && this.channel.slug) {
				return url.replace('{{slug}}', this.channel.slug)
			}
		}
		return url
	}

	/* some attributes, that can be used to fetch model data,
		 and are unique to the channel */
	get id() {
		return this.getAttribute('id')
	}
	get slug() {
		return this.getAttribute('slug')
	}

	/* the model data, when fetched, or set from outside */
	get channel() {
		return JSON.parse(this.getAttribute('channel'))
	}
	set channel(obj) {
		if (!obj) {
			this.removeAttribute('channel')
		} else {
			this.setAttribute('channel', JSON.stringify(obj))
		}
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName) {
		if (['origin'].indexOf(attrName) > -1) {
			this.render()
		}
		if (['id', 'slug'].indexOf(attrName) > -1) {
			this.channel = await this.readChannel()
			this.render()
		}
	}

	/* set loading */
	async connectedCallback() {
		if (this.channel) {
			this.render()
		} else if (this.slug) {
			this.channel = await this.readChannel()
		}
	}

	async readChannel() {
		if (this.slug) {
			this.setAttribute('loading', true)
			const res = await sdk.channels.readChannel(this.slug)
			this.removeAttribute('loading')
			return res.data
		}
	}

	render() {
		this.innerHTML = ''
		if (!this.channel) {
			this.renderNoChannel()
		} else {
			this.renderChannel()
		}
	}

	renderChannel() {
		const link = document.createElement('a')
		link.href = this.origin

		const $channelName = document.createElement('h1')
		link.innerText = this.channel.name
		$channelName.appendChild(link)

		let $channelSlug
		if (this.origin) {
			$channelSlug = document.createElement('a')
			$channelSlug.href = this.origin
			$channelSlug.innerText = '@' + this.channel.slug
		} else {
			$channelSlug = document.createElement('code')
			$channelSlug.innerText = '@' + this.channel.slug
		}

		const $channelDescription = document.createElement('article')
		$channelDescription.innerText = this.channel.description

		this.append($channelName)
		this.append($channelSlug)
		this.append($channelDescription)
	}

	renderNoChannel() {
		const $noChannel = document.createElement('span')
		$noChannel.innerText = '404 - channel not found'
		this.append($noChannel)
	}
}
