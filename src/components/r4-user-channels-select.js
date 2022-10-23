import sdk from '@radio4000/sdk'

export default class R4UserChannelsSelect extends HTMLElement {
	static get observedAttributes() {
		return ['channels', 'channel']
	}

	get channel() {
		return this.getAttribute('channel')
	}
	set channel(str) {
		this.setAttribute('channel', str)
	}

	get channels() {
		return JSON.parse(this.getAttribute('channels')) || []
	}
	set channels(obj) {
		if (obj) {
			this.setAttribute('channels', JSON.stringify(obj))
		} else {
			this.removeAttribute('channels')
		}
	}

	/* if any observed attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (R4UserChannelsSelect.observedAttributes.indexOf(attrName) > -1) {
			this.render()
		}
	}

	constructor() {
		super()
		this.$select = document.createElement('select')
		this.$select.addEventListener('input', this.onInput.bind(this))

		this.$defaultOptroup = document.createElement('optgroup')
		this.$defaultOptroup.label = 'Selected'

		this.$defaultOption = document.createElement('option')
		this.$defaultOption.defaultValue = true
		this.$defaultOption.value = ''
		this.$defaultOption.innerText = this.channel
		/* this.$defaultOption.disabled = true */

		this.$defaultOptroup.append(this.$defaultOption)

		this.$channelsOptgroup = document.createElement('optgroup')
		this.$channelsOptgroup.label = 'All'
		this.$select.append(this.$defaultOptroup)
		this.$select.append(this.$channelsOptgroup)

		this.append(this.$select)
	}

	connectedCallback() {
		this.refreshUserChannels()
	}
	onInput(event) {
		event.stopPropagation()
		/* event.preventDefault() */
		this.channel = event.target.value
		const selectedChannel = this.channels.find((channel) => {
			return channel.slug === this.channel
		})
		const inputEvent = new CustomEvent('input', {
			bubbles: true,
			detail: {
				channels: this.channels,
				channel: selectedChannel,
			}
		})
		this.dispatchEvent(inputEvent)
		this.refreshOptions(this.channel)
	}

	async refreshUserChannels() {
		const {
			error,
			data,
		} = await sdk.findUserChannels()
		this.error = error
		this.channels = data
		if (this.channels && this.channels.length) {
			this.refreshOptions(this.channels[0].slug)
		}
	}

	render() {
		this.$channelsOptgroup.innerHTML = ''
		this.channels.map((channel) => {
			const $option = document.createElement('option')
			$option.value = channel.slug
			$option.innerText = channel.slug
			this.$channelsOptgroup.append($option)
		})
	}
	refreshOptions(channelSlug) {
		this.$defaultOption.innerText = channelSlug
	}
}
