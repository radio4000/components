import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { sdk } from '@radio4000/sdk'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannelTrack extends BaseChannel {
	static properties = {
		store: { type: Object, state: true },
		params: { type: Object, state: true },
		config: { type: Object, state: true },

		track: { type: Object, reflect: true, state: true },
	}

	firstUpdated() {
		this.track = this.findTrack()
	}

	/* find data, the current channel id we want to add to */
	async findTrack() {
		const { data } = await sdk.tracks.readTrack(this.params.track_id)
		if (data && data.id) {
			return data
		}
	}

	render() {
		return html`${until(
			Promise.all([this.track, this.channel])
				.then(([track, channel]) => {
					return track ? this.renderPage(track, channel) : this.renderNoPage()
				})
				.catch(() => this.renderNoPage()),
			this.renderLoading()
		)}`
	}
	renderPage(track, channel) {
		const track_id = this.params.track_id
		return html`
			<nav>
				<nav-item>
					<code>@</code>
					<a href=${this.channelOrigin}>${channel.slug}</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks'}>tracks</a>
					<code>/</code>
					<a href=${this.channelOrigin + '/tracks' + '/' + track_id}>
						${track_id}
					</a>
				</nav-item>
				<nav-item>
					<r4-track-actions
						id=${this.params.track_id}
						@input=${this.onTrackAction}
						></r4-track-actions>
				</nav-item>
			</nav>
			<main>
				<r4-track
					.track=${track}
					id=${this.params.track_id}
					></r4-track>
				<r4-button-play
					.channel=${channel}
					.track=${track}></r4-button-play>
			</main>
			<aside>
				<r4-dialog name="update" @close=${this.onDialogClose}>
					<r4-track-update
						slot="dialog"
						id=${track.id}
						url=${track.url}
						discogsUrl=${track.discogs_url}
						title=${track.title}
						description=${track.description}
						@submit=${this.onTrackUpdate}
						></r4-channel-update>
				</r4-dialog>
				<r4-dialog name="delete" @close=${this.onDialogClose}>
					<r4-track-delete
						slot="dialog"
						id=${track.id}
						@submit=${this.onTrackDelete}
						></r4-track-delete>
				</r4-dialog>
				<r4-dialog name="share" @close=${this.onDialogClose}>
					<r4-track-sharer
						slot="dialog"
						origin=${this.channelOrigin}
						slug=${track.slug}
						></r4-track-sharer>
				</r4-dialog>
			</aside>
		`
	}
	renderNoPage() {
		return html`404 - No track with this id`
	}
	renderLoading() {
		return html`<span>Loading track...</span>`
	}

	async onTrackAction({ detail }) {
		if (detail) {
			if (detail === 'play') {
				const track = await this.track
				const channel = await this.channel
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: channel,
						track: track,
					},
				})
				this.dispatchEvent(playEvent)
			}

			if (['update', 'delete', 'share'].indexOf(detail) > -1) {
				this.openDialog(detail)
			}
		}
	}
	async onTrackDelete() {
		this.closeDialog('delete')
		page(`/${this.params.slug}/tracks`)
	}

	async onTrackUpdate({ detail }) {
		if (!detail.error && detail.data) {
			this.closeDialog('update')
		}
	}

	onDialogClose({ target }) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.config.singleChannel) {
				page('/tracks')
			} else {
				page(`/${this.params.slug}/tracks`)
			}
		}
	}

	openDialog(name) {
		const $dialog = this.querySelector(`r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.setAttribute('visible', true)
		}
	}

	async closeDialog(name) {
		const $dialog = this.querySelector(`r4-dialog[name="${name}"]`)
		if ($dialog) {
			$dialog.removeAttribute('visible')
		}
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
