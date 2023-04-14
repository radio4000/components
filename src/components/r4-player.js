// import 'radio4000-player'
import YTPlayer from 'youtube-player'
import { readChannel, readChannelTracks } from '@radio4000/sdk'
import { LitElement, html } from 'lit'
import { ref, createRef } from 'lit/directives/ref.js'

function youtubeRegex() {
	const regex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g
	return regex
}

const youtubeUrlToId = (url) => {
	const results = youtubeRegex().exec(url)
	if (!results) {
		return false
	}
	return results[1]
}

export default class R4Player extends LitElement {
	static properties = {
		slug: { type: String },

		track: { type: Object, state: true },
		playlist: { type: Object, state: true },
	}

	playerRef = createRef()

	connectedCallback() {
		super.connectedCallback()
	}

	render() {
		return html`<div>
			<h1>Player</h1>
			<p>Channel: ${this.slug}</p>
			<p>Track: ${this.track?.url}</p>
			<div ${ref(this.playerRef)}></div>
		</div>`
	}

	firstUpdated() {
		this.player = YTPlayer(this.playerRef.value)
		// this.player.on('stateChange', (event) => {
		// 	console.log(event)
		// })
	}

	async willUpdate() {
		if (this.track) {
			const ytid = youtubeUrlToId(this.track.url)
			this.player.loadVideoById(ytid)
			this.player.playVideo()
		} else if (this.slug) {
			console.log(this.slug)
			const { data: channel } = await readChannel(this.slug)
			this.channel = channel
			const { data: tracks } = await readChannelTracks(this.slug)
			this.tracks = tracks
			const ytid = youtubeUrlToId(this.tracks[0].url)
			this.player.loadVideoById(ytid)
			this.player.playVideo()
		}
	}

	createRenderRoot() {
		return this
	}
}
