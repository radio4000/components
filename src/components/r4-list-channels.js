import sdk from '@radio4000/sdk'

export default class R4ListChannels extends HTMLElement {
	static get observedAttributes() {
		return ['loading', 'limit', 'channels', 'origin']
	}
	get limit() {
		return parseFloat(this.getAttribute('limit')) || 20
	}
	get channels() {
		return JSON.parse(this.getAttribute('channels'))
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
		this.innerHTML = ''
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
			const $item = document.createElement('r4-list-channels-item')
			$item.setAttribute('channel', JSON.stringify(channel))
			this.origin && $item.setAttribute('origin', this.origin)
			$li.append($item)
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

class R4ListChannelsItem extends HTMLElement {
	static get observedAttributes() {
		return ['channel']
	}
	get channel() {
		return JSON.parse(this.getAttribute('channel'))
	}
	get origin() {
		/* origin can have tokens: {{token_name}} */
		return this.getAttribute('origin')
	}
	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (
			['channel'].indexOf(attrName) > -1
		) {
			this.render()
		}
	}

	replaceUrlTokens (url, channel) {
		const {
			slug = '',
			id = '',
			title = '',
		} = channel
		url = url.replace('{{slug}}', slug)
		url = url.replace('{{id}}', id)
		url = url.replace('{{title}}', title)
		return url
	}

	connectedCallback() {
		this.render()
	}
	render() {
		const { id, slug, name, description } = this.channel
		this.innerHTML = ''

		let $title
		if (this.origin) {
			$title = document.createElement('a')
			const url = new URL(this.replaceUrlTokens(this.origin, this.channel))
			$title.href = url.href
		} else {
			$title = document.createElement('span')
		}
		$title.innerText = slug

		this.append($title)
		this.append($id)
	}
}
customElements.define('r4-list-channels-item', R4ListChannelsItem)
