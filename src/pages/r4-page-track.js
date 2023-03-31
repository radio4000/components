import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readTrack } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageTrack extends LitElement {
	static properties = {
		slug: { type: String, reflect: true },
		trackId: { type: String, reflect: true, attribute: 'track-id' },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },

		track: { type: Object, reflect: true, state: true },
		store: { type: Object, state: true }
	}

	firstUpdated() {
		this.track = this.findTrack()
	}

	/* find data, the current channel id we want to add to */
	async findTrack() {
		const { data } = await readTrack(this.trackId)
		if (data && data.id) {
			return data
		}
	}

	render() {
		return html`${
			until(
				Promise.resolve(this.track).then((track) => {
					return track ? this.renderPage(track) : this.renderNoPage()
				}).catch(() => this.renderNoPage()),
				this.renderLoading()
			)
		}`
	}
	renderPage(track) {
		return html`
			<main>
				<r4-track
					.track=${track}
					id=${this.trackId}
					></r4-track>
				<r4-track-actions
					id=${this.trackId}
					@input=${this.onTrackAction}
					></r4-track-actions>
			</main>
			<aside>
				<r4-dialog name="update" @close=${this.onDialogClose}>
					<r4-track-update
						slot="dialog"
						id=${track.id}
						slug=${track.slug}
						name=${track.name}
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
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: this.slug,
						track: this.track.id,
					}
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
		page(`/${this.slug}`)
	}

	async onTrackUpdate({detail}) {
		if (!detail.error && detail.data) {
			this.closeDialog('update')
		}
	}

	onDialogClose({target}) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.singleChannel) {
				page('/tracks')
			} else {
				page(`/${this.slug}/tracks`)
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
