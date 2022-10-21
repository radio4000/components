import sdk from '@radio4000/sdk'

export default class R4Channel extends HTMLElement {
	static get observedAttributes() {
		return ['origin', 'id', 'slug', 'channel']
	}
	get origin() {
		const url = this.getAttribute('origin')
		if (url === 'null') {
			return null
		} else if (!url) {
			return `${window.origin}/`
		}
		return url
	}
	get id() {
		return this.getAttribute('id')
	}
	get slug() {
		return this.getAttribute('slug')
	}
	get channel() {
		return JSON.parse(this.getAttribute('channel'))
	}
	set channel(obj) {
		this.setAttribute('channel', JSON.stringify(obj))
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName) {
		if (['origin'].indexOf(attrName) > -1) {
			this.render()
		}
		if (['id', 'slug'].indexOf(attrName) > -1) {
			this.channel = await this.findChannel()
			this.render()
		}
	}

	/* set loading */
	async connectedCallback() {
		this.setAttribute('loading', true)
		this.channel = await this.findChannel()
	}

	async findChannel() {
		if (this.slug) {
			const res = await sdk.findChannelBySlug(this.slug)
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
		const $channelName = document.createElement('h1')
		$channelName.innerText = this.channel.name

		const $channelSlug = document.createElement('code')
		$channelSlug.innerText = this.channel.slug

		const $channelDescription = document.createElement('article')
		$channelDescription.innerText = this.channel.description

		this.append($channelName)
		this.append($channelSlug)
		this.append($channelDescription)
	}
	renderNoChannel() {
		const $noChannel = document.createElement('slot')
		$noChannel.setAttribute('name', 'no-channel')
		this.append($noChannel)
	}
}
