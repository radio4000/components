import sdk from '@radio4000/sdk'

export default class R4Tracks extends HTMLElement {
	static get observedAttributes() {
		return ['channel', 'limit', 'tracks']
	}
	get channel() {
		return this.getAttribute('channel')
	}
	set channel(str) {
		this.setAttribute('channel', str)
	}
	get limit() {
		return parseFloat(this.getAttribute('limit')) || 20
	}
	get tracks() {
		return JSON.parse(this.getAttribute('tracks'))
	}
	set tracks(list) {
		if (list) {
			this.setAttribute('tracks', JSON.stringify(list))
		} else {
			this.removeAttribute('tracks')
		}
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (['channel', 'limit'].indexOf(attrName) > -1) {
			this.updateTracks()
		}
		this.render()
	}

	connectedCallback() {
		this.updateTracks()
	}

	async updateTracks() {
		this.setAttribute('loading', true)
		console.log(this.channel)
		if (this.channel) {
			this.tracks = await this.getChannelTracks(this.channel)
		} else {
			this.tracks = []
		}
		this.removeAttribute('loading')
	}

	async getChannelTracks(channel) {
		const res = await sdk.findChannelTracks(channel)
		return res.data
	}

	render() {
		this.innerHTML = ''
		if (!this.tracks) {
			this.renderNoTracks()
		} else {
			this.renderTracks()
		}
	}
	renderTracks() {
		const $ul = document.createElement('ul')
		this.tracks.forEach(track => {
			const $li = document.createElement('li')
			const $item = document.createElement('r4-tracks-item')
			$item.setAttribute('track', JSON.stringify(track))
			$li.append($item)
			$ul.append($li)
		})
		this.append($ul)
	}

	renderNoTracks() {
		const $text = document.createElement('p')
		$text.innerText = 'No tracks'
		this.append($text)
	}
}


class R4TracksItem extends HTMLElement {
	static get observedAttributes() {
		return ['track']
	}
	get track() {
		return JSON.parse(this.getAttribute('track'))
	}
	connectedCallback() {
		this.render()
	}
	render() {
		const { id, title } = this.track
		this.innerHTML = ''

		let $title = document.createElement('span')
		$title.innerText = title
		$title.title = id

		this.append($title)
	}
}
customElements.define('r4-tracks-item', R4TracksItem)
