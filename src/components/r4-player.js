import 'radio4000-player'
import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		title: {type: String},
		query: {type: String},
		image: {type: String},
		tracks: {type: Array},
		track: {type: String},
		shuffle: {type: Boolean},
		config: {type: Object},
	}

	get playlist() {
		return {
			title: this.title,
			image: this.image,
			tracks: this.tracks,
			query: this.query,
		}
	}
	get emptyPlaylist() {
		return {tracks: []}
	}

	render() {
		return html`
			<radio4000-player
				${ref(this.playerRef)}
				@playerReady=${this.onPlayerReady}
				@trackChanged=${this.onTrackChanged}
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
		if (changedProps.has('config')) {
			if (this.config.isPlaying) {
				this.play()
			} else {
				this.pause()
			}
		}
	}

	play() {
		if (!this.$player) return

		if (this.tracks?.length) {
			this.$player.updatePlaylist(this.playlist)
		} else {
			this.$player.updatePlaylist(this.emptyPlaylist)
		}

		if (this.track) {
			this.$player.trackId = this.track
			if (this.$playButton.checked === false) {
				this.$playButton.click()
			}
		}
	}

	pause() {
		if (this.$playButton?.checked === true) {
			this.$playButton.click()
		}
	}

	stop() {
		this.removeAttribute('track')
		this.removeAttribute('image')
		this.removeAttribute('title')
		this.removeAttribute('query')
		this.removeAttribute('tracks')
	}

	onTrackChanged(event) {
		this.dispatchEvent(
			new CustomEvent('trackchange', {
				bubbles: true,
				detail: event.detail,
			}),
		)
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
