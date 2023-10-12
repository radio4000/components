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
	async connectedCallback() {
		super.connectedCallback()
		this.canEdit = await sdk.tracks.canEditTrack(this.params.track_id)
		if (!this.canEdit) {
			page(`${this.channelOrigin}`)
		}
		await this.loadTrack()
	}
	render() {
		if (this.error) {
			return html`error: ${this.error.message}`
		}
		return html`
			<r4-page-header>
				<h1>Delete track</h1>
			</r4-page-header>
			<r4-page-main> ${this.track ? this.renderDelete() : html`<p>Loading...</p>`} </r4-page-main>
		`
	}
	renderDelete() {
		return html`
			<p>
				Confirm deleting the track <a href=${this.channelOrigin + '/tracks/' + this.track.id}>${this.track.title}</a>
				from <a href=${this.channelOrigin}>${this.params.slug}</a>'s
				list of <a href=${this.channelOrigin + '/tracks'}>tracks</a>?
			</p>
			<r4-track-delete id=${this.track.id} @submit=${this.onDelete}></r4-channel-delete>`
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
