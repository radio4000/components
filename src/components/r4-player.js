import 'radio4000-player'
import { html, LitElement, css } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import styles from '../styles/components/r4-player.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		isPlaying: {type: Boolean, attribute: 'is-playing', reflect: true },
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
		const $playerRef = this.playerRef.value
		this.$player = $playerRef.getVueInstance()
		this.$playButton = $playerRef.querySelector('input.PlayPause-state')
		if (this.tracks) {
			this.play()
		}
	}

	willUpdate(changedProps) {
		if (changedProps.has('tracks') || changedProps.has('track')) {
			this.play()
		}
		if (changedProps.has('isPlaying')) {
			if (this.isPlaying) {
				this.play()
			} else {
				this.pause()
			}
		}
	}

	play() {
		if (!this.$player) {
			return
		}

		if (this.tracks && this.tracks.length) {
			const playlist = {
				title: this.name,
				image: this.image,
				tracks: this.tracks,
			}
			this.$player.updatePlaylist(playlist)
		} else {
			this.$player.updatePlaylist({ tracks: [] })
		}

		if (this.track) {
			this.$player.trackId = this.track
			if (this.$playButton.checked === false) {
				this.$playButton.click()
			}
		}
	}
	pause() {
		console.log('r4-player pause')
		/* click the radio400-player button */
		// when in play mode, toggle pause
		if (this.$playButton.checked === true) {
			this.$playButton.click()
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
