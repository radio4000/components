import 'radio4000-player'
import { html, LitElement, css } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'
import styles from '../styles/components/r4-player.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		isPlaying: {type: Boolean, attribute: 'is-playing', reflect: true},
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

		if (this.tracks) {
			this.play()
		}
	}

	willUpdate(changedProperties) {
		if (
			changedProperties.has('tracks')
			|| changedProperties.has('track')
		) {
			this.play()
		}

		if (changedProperties.has('is-playing')) {
			console.log('willUpdate@is-playing', this.isPlaying)
			if (this.isPlaying) {
				this.play()
			} else {
				this.pause()
			}
		}
	}

	play() {
		console.log('r4-player play')
		if (!this.player) {
			return
		}

		if (this.tracks && this.tracks.length) {
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
	pause() {
		console.log('r4-player pause')
		/* click the radio400-player button */
		const $playToggleBtn = this.playerRef.querySelector('input.PlayPause-state')
		// when in play mode, toggle pause
		if ($playToggleBtn.checked === true) {
			$playToggleBtn.click()
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
