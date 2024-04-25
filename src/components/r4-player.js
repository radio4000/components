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
		shuffle: {type: Boolean},
		isPlaying: {type: Boolean},
	}

	get playlist() {
		return {
			title: this.name,
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
		/** @type {HTMLInputElement} */
		this.$playButton = $playerRef.querySelector('input.PlayPause-state')
		if (this.tracks || this.track) {
			this.play()
		}
	}

	willUpdate(changedProps) {
		if (changedProps.has('track')) {
			// console.log('track changed to', this.track.title)
			const t  = this.$player.serializeTrack(this.track)
			this.$player.playTrack(t)
		}

		if (changedProps.has('tracks')) {
			if (this.tracks?.length) {
				console.log('updatePlaylist', {before: changedProps.get('tracks'), after: this.tracks})
				this.$player.updatePlaylist(this.playlist)
				if (!this.track) {
					console.log('play last track?')
					// const t  = this.$player.serializeTrack(this.track || this.tracks.at(-1))
					// console.log('schedule internal play track', t.title)
					// this.$player.playTrack(t)
				}
			} else {
				console.log('tracks changed but no tracks')
				this.$player.updatePlaylist(this.emptyPlaylist)
			}
		}

		if (changedProps.has('isPlaying')) {
			console.log('is playing changed', this.isPlaying)
			if (this.isPlaying) {
				this.play()
			} else {
				this.pause()
			}
		}
	}

	play() {
		if (!this.$player) return
		if (this.track) {
			// this.$player.trackId = this.track.id
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
		this.removeAttribute('name')
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
