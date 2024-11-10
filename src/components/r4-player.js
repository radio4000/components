import 'radio4000-player'
import {html, LitElement} from 'lit'
import {ref, createRef} from 'lit/directives/ref.js'

export default class R4Player extends LitElement {
	playerRef = createRef()

	static properties = {
		name: {type: String},
		query: {type: String},
		image: {type: String},
		tracks: {type: Array},
		track: {type: String},
		slug: {type: String},
		href: {type: String},
		shuffle: {type: Boolean},
		isPlaying: {type: Boolean},
	}

	get playlist() {
		return {
			title: this.name,
			image: this.image,
			tracks: this.tracks,
			query: this.query,
			slug: this.slug,
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
				host-root-url=${this.href + '/'}
				platform="true"
			></radio4000-player>
		`
	}

	onPlayerReady() {
		const $playerRef = this.playerRef.value
		this.$player = $playerRef.getVueInstance()
		/** @type {HTMLInputElement} */
		this.$playButton = $playerRef.querySelector('input.PlayPause-state')
		if (this.tracks || this.track) {
			this.play()
		}
	}

	willUpdate(changedProps) {
		if (this.$player && changedProps.has('track')) {
			const t = this.$player.serializeTrack(this.track)
			this.$player.playTrack(t)
		}

		if (this.$player && changedProps.has('tracks')) {
			if (this.tracks?.length) {
				this.$player.updatePlaylist(this.playlist)
			} else {
				this.$player.updatePlaylist(this.emptyPlaylist)
			}
		}

		if (changedProps.has('isPlaying')) {
			this.isPlaying ? this.play() : this.pause()
		}
	}

	play() {
		if (!this.$player) return
		if (this.track && this.$playButton.checked === false) {
			this.$playButton.click()
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
		this.removeAttribute('name')
		this.removeAttribute('query')
		this.removeAttribute('tracks')
	}

	/** The `detail` prop contains the track as sent from <radio4000-player> */
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
