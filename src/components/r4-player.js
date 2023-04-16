import 'radio4000-player'
import { html, LitElement } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		tracks: { type: Array },
		track: {},
		name: {},
		image: {},
	}

	render() {
		return html`
			<radio4000-player
				${ref(this.playerRef)}
				@playerReady=${this.onPlayerReady}
			></radio4000-player>
		`
	}

	onPlayerReady() {
		this.player = this.playerRef.value.getVueInstance()
	}

	willUpdate(changedProperties) {
		if (
			changedProperties.has('tracks')
			|| changedProperties.has('track')
		) {
			this.play()
		}
	}

	play() {
		if (!this.player) {
			return
		}

		if (this.tracks.length) {
			const playlist = {
				title: this.name,
				image: this.image,
				tracks: this.tracks,
			}
			this.player.updatePlaylist(playlist)
		} else {
			this.player.updatePlaylist({ tracks: [] })
		}

		if (this.track) {
			this.player.trackId = this.track
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
