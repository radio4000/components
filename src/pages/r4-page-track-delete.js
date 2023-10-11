import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageTrackDelete extends BaseChannel {
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
			return html`error: ${this.error.message}`
		}

		const {track} = this
		const link = this.channelOrigin

		return html`
			<nav>
				<nav-item> <code>@</code><a href=${link}>${this.params.slug}</a> </nav-item>
				<nav-item><code>></code> <a href=${link + '/tracks'}>Tracks</a></nav-item>
				<nav-item><code>></code> ${track?.title}</nav-item>
			</nav>
			<main>
				<h1>Delete track</h1>
				${track
					? html`
						<p>Are you sure you want to delete <em>${track?.title}</em>?</p>
						<r4-track-delete id=${track.id} @submit=${this.onDelete}></r4-channel-delete>`
					: html`<p>Loading...</p>`}
			</main>
		`
	}

	async onDelete({detail}) {
		/* no error? we deleted */
		if (!detail?.data) {
			page(`/${this.params.slug}/tracks`)
		}
	}

	createRenderRoot() {
		return this
	}
}
