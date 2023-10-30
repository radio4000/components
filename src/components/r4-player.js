import 'radio4000-player'
import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'
import {createImage} from './r4-avatar.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		title: {type: String},
		query: {type: String},
		image: {type: String},
		tracks: {type: Array},
		track: {type: String},
		shuffle: {type: Boolean},
		// The config contains isPlaying, playingChannel, playingTracks, playingTrack
		config: {type: Object},
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
			const playlist = {
				title: this.name,
				image: createImage(this.image),
				tracks: this.tracks,
				query: this.query,
			}
			this.$player.channelSlug = this.config.playingChannel?.slug
			this.$player.updatePlaylist(playlist)
		} else {
			this.$player.updatePlaylist({tracks: []})
		}

		if (this.track) {
			this.$player.trackId = this.track
			if (this.$playButton.checked === false) {
				this.$playButton.click()
			}
		}
	}

	pause() {
		/* click the radio400-player button */
		// when in play mode, toggle pause
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
			})
		)
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
