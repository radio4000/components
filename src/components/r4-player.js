import 'radio4000-player'

const template = document.createElement('template')
template.innerHTML = `<radio4000-player></radio4000-player>`

export default class R4Player extends HTMLElement {
	static get observedAttributes() {
		return ['tracks']
	}

	get tracks() {
		const tracksAttr = JSON.parse(this.getAttribute('tracks'))
		return tracksAttr || []
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (['tracks'].indexOf(attrName) > -1) {
			newVal && this.playTracks()
		}
	}

	connectedCallback() {
		this.render()
		this.$player = this.querySelector('radio4000-player')
		this.$player.addEventListener('playerReady', this.onPlayerReady.bind(this))
	}

	render() {
		this.append(template.content.cloneNode(true))
	}
	onPlayerReady() {
		console.log('player ready')
		this.player = this.$player.getVueInstance()
	}

	playTracks() {
		if (!this.player) {
			console.info('radio4000-player not yet ready')
			return
		}

		console.log('play tracks')
		if (this.tracks.length) {
			const playlist = {
				title: '',
				image: '',
				tracks: this.tracks,
			}
			this.player.updatePlaylist(playlist)
		} else {
			this.player.updatePlaylist({ tracks: [] })
		}
	}
}
