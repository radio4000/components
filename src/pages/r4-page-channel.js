import sdk from '@radio4000/sdk'
import page from 'page/page.mjs'

/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		<r4-channel slug></r4-channel>
		<r4-channel-actions slug></r4-channel-actions>
	</header>
	<main>
		<r4-tracks channel pagination="true"></r4-tracks>
	</main>
	<aside>
		<r4-dialog name="update">
			<r4-channel-update slot="dialog" slug></r4-channel-update>
		</r4-dialog>
		<r4-dialog name="delete">
			<r4-channel-delete slot="dialog" slug></r4-channel-delete>
		</r4-dialog>
		<r4-dialog name="share">
			<r4-channel-sharer slot="dialog" slug></r4-channel-sharer>
		</r4-dialog>
	</aside>
`

export default class R4PageHome extends HTMLElement {
	static get observedAttributes() {
		return ['href', 'slug', 'channel']
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
	async connectedCallback() {
		const $dom = template.content.cloneNode(true)
		this.$channel = $dom.querySelector('r4-channel')
		this.$actions = $dom.querySelector('r4-channel-actions')
		this.$tracks = $dom.querySelector('r4-tracks')
		this.$channelUpdate = $dom.querySelector('r4-channel-update')
		this.$channelDelete = $dom.querySelector('r4-channel-delete')
		this.$channelSharer = $dom.querySelector('r4-channel-sharer')

		this.addEventListener($dom)
		await this.init()
		this.render($dom)
	}
	async init() {
		this.channel = await this.findSelectedChannel()
		this.updateAttributes()
	}
	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await sdk.findChannelBySlug(this.slug)
		if (data && data.id) {
			return data
		}
	}
	updateAttributes() {
		let {
			id, // always present
			slug, // always present, cannot be empty, like uid
			name, // cannot be empty
			description = '', // can be empty
		} = this.channel
		this.$channel.setAttribute('slug', slug)
		this.$actions.setAttribute('slug', slug)
		this.$tracks.setAttribute('channel', slug)

		/* all channel attributes needed, for the form to update */
		this.$channelUpdate.setAttribute('id', id)
		this.$channelUpdate.setAttribute('slug', slug)
		name ? (
			this.$channelUpdate.setAttribute('name', name)
		) : (
			this.$channelUpdate.removeAttribute('name')
		)
		description ? (
			this.$channelUpdate.setAttribute('description', description)
		) : (
			this.$channelUpdate.removeAttribute('description')
		)

		/* only id needed */
		this.$channelDelete.setAttribute('id', id)

		/* only slug needed for the sharer */
		this.$channelSharer.setAttribute('slug', slug)
		// the {{slug}} pattern is replaced by sharer, to build a correct channel url
		this.$channelSharer.setAttribute('origin', this.href + '/{{slug}}')
	}
	addEventListener() {
		this.$actions.addEventListener('input', this.onChannelAction.bind(this))
		this.$channelUpdate.addEventListener('submit', this.onChannelUpdate.bind(this))
		this.$channelDelete.addEventListener('submit', this.onChannelDelete.bind(this))
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

			if (['update', 'delete', 'share'].indexOf(detail) > -1) {
				/* refresh the channel data */
				await this.init()
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

	openDialog(name) {
		this.querySelector(`r4-dialog[name="${name}"]`).open()
	}

	async closeDialog(name) {
		this.querySelector(`r4-dialog[name="${name}"]`).close()
	}

	render(dom) {
		this.append(dom)
	}
}
