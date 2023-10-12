import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import BaseChannel from './base-channel'

export default class R4PageChannelUpdate extends BaseChannel {
	async loadTrack() {
		const {data, error} = await sdk.tracks.readTrack(this.params.track_id)
		this.track = data
		this.error = error
	}

	render() {
		if (!this.track) {
			this.loadTrack()
		}

		if (this.error) {
			return html`<p>Error: ${this.error.message}</p>`
		}

		const {track} = this
		const link = this.channelOrigin

		return html`
			<r4-page-header>
				<nav>
					<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
					<nav-item><code>></code> <a href=${link + '/tracks'}>Tracks</a></nav-item>
					<nav-item><code>></code> ${track?.title}</nav-item>
				</nav>
			</r4-page-header>
			<r4-page-main>
				<h1>Update track</h1>
				${track ? this.renderTrack() : html`<p>Loading...</p>`}
			</r4-page-main>
		`
	}
	renderTrack() {
		const {track} = this
		return html`
			<r4-track-update
				id=${track.id}
				url=${track.url}
				title=${track.title}
				discogsUrl=${track.discogsUrl}
				description=${track.description}
				@submit=${this.onUpdate}
			></r4-track-update>
			<p>
				<a href=${link + '/tracks/' + track.id + '/delete'}>Delete track</a>
			</p>
			<p></p>
		`
	}

	async onUpdate({detail}) {
		console.log(detail)
		if (!detail.error) {
			// all good
		}
	}

	createRenderRoot() {
		return this
	}
}
