import { html, LitElement } from 'lit'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageChannel extends LitElement {
	static properties = {
		slug: { type: String, reflect: true },
		href: { type: String, reflect: true },
		channel: { type: Object, reflect: true, state: true },
		trackId: { type: String, reflect: true, attribute: 'track-id' },
		limit: { type: Number, reflect: true },
		pagination: { type: Boolean, reflect: true },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },
	}

	get channelOrigin() {
		return this.singleChannel ? this.href : `${this.href}/{{slug}}`
	}

	get tracksOrigin() {
		if (this.singleChannel) {
			return this.href + '/tracks/{{id}}'
		} else {
			return this.href + '/' + this.slug + '/tracks/{{id}}'
		}
	}

	async firstUpdated() {
		this.channel = await this.findSelectedChannel()
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await readChannel(this.slug)
		if (data && data.id) {
			return data
		}
	}

	async onChannelAction({ detail }) {
		if (detail) {
			if (detail === 'play') {
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: this.slug
					}
				})
				this.dispatchEvent(playEvent)
			}
			if (detail === 'create-track') {
				page(`/add?channel=${this.slug}`)
			}

			if (detail === 'tracks') {
				if (this.singleChannel) {
					page(`/tracks`)
				} else {
					page(`/${this.slug}/tracks`)
				}
			}

			if (['update', 'delete', 'share'].indexOf(detail) > -1) {
				/* refresh the channel data */
				this.channel = await this.findSelectedChannel()
				this.openDialog(detail)
			}
			console.log('channel action', detail)
		}
	}

	async onChannelDelete(event) {
		/* no error? we deleted */
		if (!event.detail) {
			await this.init() // refresh channel data
			this.closeDialog('delete')
		}
	}

	async onChannelUpdate(event) {
		if (!event.detail.error && !event.detail.data) {
			await this.init() // refresh channel data
			this.closeDialog('update')
		}
	}

	onDialogClose({target}) {
		const name = target.getAttribute('name')
		console.log('on page chanel dialog close', name)
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
		console.log('open', name, $dialog)
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

	render() {
		if (this.channel) {
			return html`
				<header>
					<r4-channel
						.channel=${this.channel}
						origin="${this.channelOrigin}"
						slug="${this.channel.slug}"
						></r4-channel>
					<r4-channel-actions
						slug="${this.channel.slug}"
						@input="${this.onChannelAction.bind(this)}"
						></r4-channel-actions>
				</header>
				<main>
					<r4-tracks
						channel="${this.channel.slug}"
						origin="${this.tracksOrigin}"
						limit="5"
						></r4-tracks>
				</main>
				<aside>
					<r4-dialog name="track" @close="${this.onDialogClose.bind(this)}">
						<r4-track
							slot="dialog"
							id="${this.trackId}"
							></r4-track>
					</r4-dialog>
					<r4-dialog name="update" @close="${this.onDialogClose.bind(this)}">
						<r4-channel-update
							slot="dialog"
							slug="${this.channel.slug}"
							id="${this.channel.id}"
							name="${this.channel.name}"
							description="${this.channel.description}"
							submit="${this.onChannelUpdate.bind(this)}"
							></r4-channel-update>
					</r4-dialog>
					<r4-dialog name="delete" @close="${this.onDialogClose.bind(this)}">
						<r4-channel-delete
							slot="dialog"
							id="${this.channel.id}"
							submit="${this.onChannelDelete.bind(this)}"
							></r4-channel-delete>
					</r4-dialog>
					<r4-dialog name="share" @close="${this.onDialogClose.bind(this)}">
						<r4-channel-sharer
							slot="dialog"
							origin="${this.channelOrigin}"
							slug="${this.channel.slug}"
							></r4-channel-sharer>
					</r4-dialog>
				</aside>
			`
		}
	}
	createRenderRoot() {
		return this
	}
}
