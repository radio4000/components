import sdk from '@radio4000/sdk'

export default class R4ListChannels extends HTMLElement {
	static get observedAttributes() {
		return ['loading', 'limit', 'channels']
	}
	get limit() {
		return parseFloat(this.getAttribute('limit')) || 20
	}
	get channels() {
		return JSON.parse(this.getAttribute('channels'))
	}
	set channels(arr = []) {
		this.removeAttribute('loading')
		this.setAttribute('channels', JSON.stringify(arr))
		return arr
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (
			['channels'].indexOf(attrName) > -1
		) {
			this.render()
		}
	}

	/* set loading */
	async connectedCallback() {
		this.setAttribute('loading', true)
		this.channels = await this.getChannels()
	}

	async getChannels() {
		const res = await sdk.findChannels(this.limit)
		return res.data
	}
	render() {
		if (!this.channels) {
			this.renderNoChannels()
		} else {
			this.renderChannels()
		}
	}
	renderChannels() {
		const $ul = document.createElement('ul')
		this.channels.forEach(channel => {
			const $li = document.createElement('li')
			$li.innerText = channel.slug
			$ul.append($li)
		})
		this.append($ul)
	}
	renderNoChannels() {
		const $text = document.createElement('p')
		$text.innerText = 'No channels'
		this.append($text)
	}
}
