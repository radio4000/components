import {html} from 'lit'
import {sdk} from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class BaseChannelTrack extends BaseChannel {
	static properties = {
		track: {type: Object, state: true},
		trackError: {type: Object, state: true},
	}
	async setTrack() {
		const {data, error} = await sdk.tracks.readTrack(this.params.track_id)
		this.track = data
		this.trackError = error
	}
	async connectedCallback() {
		super.connectedCallback()
		if (!this.channel) {
			await this.setChannel()
		}
		if (!this.track) {
			await this.setTrack()
		}
		if (!this.canEdit) {
			/* page(this.channelOrigin + '/tracks/' + this.track.id) */
		}
	}
	async onDelete({detail}) {
		/* no error? we deleted */
		if (!detail?.data) {
			console.log('url', this.channelOrigin + '/tracks/')
			debugger
			page(this.channelOrigin + '/tracks/')
		}
	}
	async onUpdate({detail}) {
		if (!detail.error) {
			/* page(this.channelOrigin + '/tracks/') */
		}
	}
}
