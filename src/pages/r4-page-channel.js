import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageChannel extends LitElement {
	static properties = {
		href: { type: String, reflect: true },
		slug: { type: String, reflect: true },
		limit: { type: Number, reflect: true },
		pagination: { type: Boolean, reflect: true },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },
		channel: { type: Object, reflect: true, state: true },
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
		await this.init()
	}
	init() {
		// a promise for the `until` directive
		this.channel = this.findSelectedChannel(this.slug)
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel(slug) {
		const { data } = await readChannel(slug)
		if (data && data.id) {
			return data
		}
	}

	/* render */
	render() {
		return html`${
			until(
				Promise.resolve(this.channel).then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				}).catch(() => this.renderNoPage()),
				this.renderLoading()
			)
		}`
	}
	renderPage(channel) {
		return html`
			<header>
				<r4-channel
					.channel=${channel}
					origin=${this.channelOrigin}
					slug=${channel.slug}
					></r4-channel>
				<r4-channel-actions
					slug=${channel.slug}
					@input=${this.onChannelAction}
					></r4-channel-actions>
			</header>
			<aside>
				<r4-dialog name="update" @close=${this.onDialogClose}>
					<r4-channel-update
						slot="dialog"
						id=${channel.id}
						slug=${channel.slug}
						name=${channel.name}
						description=${channel.description}
						@submit=${this.onChannelUpdate}
						></r4-channel-update>
				</r4-dialog>
				<r4-dialog name="delete" @close=${this.onDialogClose}>
					<r4-channel-delete
						slot="dialog"
						id=${channel.id}
						@submit=${this.onChannelDelete}
						></r4-channel-delete>
				</r4-dialog>
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
	renderNoPage() {
		return html`404 - No channel with this slug`
	}
	renderLoading() {
		return html`<span>Loading channel...</span>`
	}

	/* event handlers */
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
				if (this.singleChannel) {
					page('/add')
				} else {
					page(`/add/?channel=${this.slug}`)
				}
			}

			if (detail === 'tracks') {
				if (this.singleChannel) {
					page(`/tracks`)
				} else {
					page(`/${this.slug}/tracks`)
				}
			}

			if (['update', 'delete', 'share'].indexOf(detail) > -1) {
				this.openDialog(detail)
			}
			console.log('channel action', detail)
		}
	}

	async onChannelDelete({detail}) {
		/* no error? we deleted */
		if (!detail.data) {
			this.closeDialog('delete')
			page('/')
		}
	}

	async onChannelUpdate({detail}) {
		const {
			data: {
				slug: newSlug
			}
		} = {} = detail
		if (newSlug && newSlug !== this.slug) {
			page(`/${newSlug}`)
		} else {
			this.init()
		}
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
