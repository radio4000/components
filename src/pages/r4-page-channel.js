import { html, LitElement } from 'lit'
import { canEditChannel, readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

// Base class to extend from
export class ChannelPage extends LitElement {
	static properties = {
		channel: { type: Object, state: true },
		canEdit: { type: Boolean, state: true },
		// from the router
		params: { type: Object, state: true },
		store: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/{{slug}}`
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/{{id}}'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/{{id}}'
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.setChannel()
	}

	// Set channel from the slug in the URL.
	async setChannel() {
		this.channel = (await readChannel(this.params.slug)).data
		this.canEdit = await canEditChannel(this.params.slug)
	}

	render() {
		return html``
	}
}

export default class R4PageChannel extends ChannelPage {
	render() {
		const {channel} = this
		if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		if (!channel) return html`<p>Loading...</p>`

		return html`
			<header>
				<r4-avatar image=${channel.image}></r4-avatar>

				<h1>${channel.name}</h1>
				<p>@${channel.slug}</p>
				<p>${channel.description}</p>

				<r4-channel-actions
					slug=${channel.slug}
					?can-edit=${this.canEdit}
					@input=${this.onChannelAction}
					></r4-channel-actions>
			</header>
			<main>
				<r4-tracks channel=${channel.slug} origin=${this.tracksOrigin} limit="5"></r4-tracks>
			</main>
			<aside>
				<r4-dialog name="share" @close=${this.onDialogClose}>
					<r4-channel-sharer
						slot="dialog"
						origin=${this.channelOrigin}
						slug=${channel.slug}
						></r4-channel-sharer>
				</r4-dialog>
			</aside>
		`
	}

	/* event handlers from <r4-channel-actions> */
	async onChannelAction({ detail }) {
		if (detail) {
			if (detail === 'play') {
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: this.params.slug
					}
				})
				this.dispatchEvent(playEvent)
			}
			if (detail === 'create-track') {
				if (this.config.singleChannel) {
					page('/add')
				} else {
					page(`/add/?slug=${this.params.slug}`)
				}
			}
			if (detail === 'tracks') {
				if (this.config.singleChannel) {
					page(`/tracks`)
				} else {
					page(`/${this.params.slug}/tracks`)
				}
			}
			if (detail === 'update') {
				page(`/${this.params.slug}/update`)
			}
			if (['share'].indexOf(detail) > -1) {
				this.openDialog(detail)
			}
		}
	}

	onDialogClose({target}) {
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

	closeDialog(name) {
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
