import sdk from '@radio4000/sdk/src/default.js'

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
	attributeChangedCallback(attrName, newVal) {
		if (this.constructor.observedAttributes.indexOf(attrName) > -1) {
			this.render()
			if (attrName === 'channel') {
				this.refreshOptions(newVal)
			}
		}
	}

	constructor() {
		super()

		supabase.auth.onAuthStateChange(this.onAuthStateChange.bind(this))

		this.$select = document.createElement('select')
		this.$select.addEventListener('input', this.onInput.bind(this))

		this.$defaultOptroup = document.createElement('optgroup')
		this.$defaultOptroup.label = 'Selected'

		this.$defaultOption = document.createElement('option')
		this.$defaultOption.defaultValue = true
		this.$defaultOption.value = ''
		this.$defaultOption.innerText = this.channel ? this.channel : '…'

		this.$defaultOptroup.append(this.$defaultOption)

		this.$channelsOptgroup = document.createElement('optgroup')
		this.$channelsOptgroup.label = 'All'
		this.$select.append(this.$defaultOptroup)
		this.$select.append(this.$channelsOptgroup)

		this.append(this.$select)
	}

	connectedCallback() {
		if (this.channels && this.channels.length) {
			this.refreshOptions(this.channels[0].slug)
		} else {
			this.refreshUserChannels()
		}
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

	onAuthStateChange() {
		this.refreshUserChannels()
	}

	async refreshUserChannels() {
		const { data: user } = await readUser()
		if (user) {
			const {
				error,
				data,
			} = await sdk.channels.readUserChannels()

			this.error = error
			this.channels = data
			if (this.channels && this.channels.length) {
				if (this.channel) {
					this.refreshOptions(this.channel)
				} else {
					this.refreshOptions(this.channels[0].slug)
				}
			}
		} else {
			this.channels = []
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
