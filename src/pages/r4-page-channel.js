import { html } from 'lit'
import page from 'page/page.mjs'
import BaseChannel from './base-channel'

export default class R4PageChannel extends BaseChannel {
	get coordinates() {
		return {
			longitude: this.channel.longitude,
			latitude: this.channel.latitude,
		}
	}
	render() {
		const { channel } = this
		if (channel === null) return html`<p>404 - There is no channel with this slug.</p>`
		if (!channel) return html`<p>Loading...</p>`

		return html`
			<header>
				<h1>${channel.name}</h1>
				<p>
					@${channel.slug}
					${ this.coordinates? this.renderMap() : null}
				</p>
				<p>${channel.description}</p>
				<r4-avatar image=${channel.image}></r4-avatar>
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
					<r4-channel-sharer slot="dialog" origin=${this.channelOrigin} slug=${channel.slug}></r4-channel-sharer>
				</r4-dialog>
			</aside>
		`
	}

	renderMap() {
		const mapUrl = `${this.config.href}/map?longitude=${this.coordinates.longitude}&latitude=${this.coordinates.latitude}&slug=${this.channel.slug}`
		return html`(<a href=${mapUrl}>map</a>)`
	}

	/* event handlers from <r4-channel-actions> */
	async onChannelAction({ detail }) {
		if (detail) {
			if (detail === 'play' && this.channel) {
				const playEvent = new CustomEvent('r4-play', {
					bubbles: true,
					detail: {
						channel: this.channel,
					},
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

	onDialogClose({ target }) {
		const name = target.getAttribute('name')
		if (name === 'track') {
			if (this.config.singleChannel) {
				page('/track')
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
