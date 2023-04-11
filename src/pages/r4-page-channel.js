import { html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js'
import { readChannel } from '@radio4000/sdk'
import page from 'page/page.mjs'

export default class R4PageChannel extends LitElement {
	static properties = {
		store: { type: Object, state: true },
		params: { type: Object, state: true },
		config: { type: Object, state: true },

		limit: { type: Number, reflect: true },
		pagination: { type: Boolean, reflect: true },
		singleChannel: { type: Boolean, reflect: true, attribute: 'single-channel' },

		channel: { type: Object, reflect: true, state: true },
	}

	constructor()	{
		super()
		this.limit = 5
		this.pagination = false
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

	async firstUpdated() {
		await this.init()
	}

	init() {
		// a promise for the `until` directive
		this.channel = this.findSelectedChannel()
	}

	/* find data, the current channel id we want to add to */
	async findSelectedChannel() {
		const {data} = await readChannel(this.params.slug)
		if (data && data.id) {
			return data
		}
	}

	/* render */
	render() {
		return html`${
			until(
				Promise.resolve(this.findSelectedChannel()).then((channel) => {
					return channel ? this.renderPage(channel) : this.renderNoPage()
				}).catch(() => this.renderNoPage()),
				this.renderLoading()
			)
		}`
	}

	renderPage(channel) {
		return html`
			<header>
				<h1>${channel.name}</h1>
				<p>@${channel.slug}</p>
				<p>${channel.description}</p>

				<r4-channel-actions
					slug=${channel.slug}
					@input=${this.onChannelAction}
					></r4-channel-actions>
			</header>
			<main>
				${
					/* somehow this has a silent error */
					/* html`<r4-tracks
						 channel=${channel.slug}
						 origin=${this.tracksOrigin}
						 limit="5"
						 ></r4-tracks>` */
				null }
		</main>
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

			if (['update', 'delete', 'share'].indexOf(detail) > -1) {
				this.openDialog(detail)
			}
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
		if (newSlug && newSlug !== this.params.slug) {
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
