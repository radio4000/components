import { html, render } from 'lit-html'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageChannel extends HTMLElement {
	static get observedAttributes() {
		return ['href', 'slug', 'channel', 'limit', 'pagination', 'track', 'single-channel']
	}
	get slug() {
		return this.getAttribute('slug')
	}
	get href() {
		return this.getAttribute('href')
	}
	get channel () {
		return JSON.parse(this.getAttribute('channel'))
	}
	set channel(obj) {
		if (obj) {
			this.setAttribute('channel', JSON.stringify(obj))
		} else {
			this.removeAttribute('channel')
		}
	}
	get limit() {
		return parseFloat(this.getAttribute('limit')) || 0
	}
	get pagination() {
		return this.getAttribute('pagination') === 'true'
	}
	get singleChannel() {
		return this.getAttribute('single-channel') === 'true'
	}

	/* a track id in this channel */
	get track() {
		return this.getAttribute('track')
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

	async attributeChangedCallback(attrName) {
		if (attrName !== 'channel') {
			this.channel = await this.findSelectedChannel()
		}
		if (this.constructor.observedAttributes.indexOf(attrName) > -1) {
			this.render()
		}
	}

	async connectedCallback() {
		this.channel = await this.findSelectedChannel()
		this.render()
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
			render(html`
				<header>
					<r4-channel
						origin=${this.channelOrigin}
						slug=${this.channel.slug}
						></r4-channel>
					<r4-channel-actions
						slug=${this.channel.slug}
						@input=${this.onChannelAction.bind(this)}
						></r4-channel-actions>
				</header>
				<main>
					<r4-tracks
						channel=${this.channel.slug}
						limit="5"
						origin=${this.tracksOrigin}
						></r4-tracks>
				</main>
				<aside>
					<r4-dialog name="track" @close=${this.onDialogClose.bind(this)}>
						<r4-track
							slot="dialog"
							id=${this.track}
							></r4-track>
					</r4-dialog>
					<r4-dialog name="update" @close=${this.onDialogClose.bind(this)}>
						<r4-channel-update
							slot="dialog"
							slug=${this.channel.slug}
							id=${this.channel.id}
							name=${this.channel.name}
							description=${this.channel.description}
							submit=${this.onChannelUpdate.bind(this)}
							></r4-channel-update>
					</r4-dialog>
					<r4-dialog name="delete" @close=${this.onDialogClose.bind(this)}>
						<r4-channel-delete
							slot="dialog"
							slug=${this.channel.slug}
							id=${this.channel.id}
							submit=${this.onChannelDelete.bind(this)}
							></r4-channel-delete>
					</r4-dialog>
					<r4-dialog name="share" @close=${this.onDialogClose.bind(this)}>
						<r4-channel-sharer
							slot="dialog"
							origin=${this.channelOrigin}
							slug=${this.channel.slug}
							></r4-channel-sharer>
					</r4-dialog>
				</aside>
			`, this)
		}
	}
}
