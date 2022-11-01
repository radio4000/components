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
		this.$channel.setAttribute('slug', this.slug)
		this.$actions.setAttribute('slug', this.slug)
		this.$tracks.setAttribute('channel', this.slug)
		this.$channelUpdate.setAttribute('id', this.channel.id)
		this.$channelDelete.setAttribute('id', this.channel.id)
		this.$channelSharer.setAttribute('slug', this.slug)
		this.$channelSharer.setAttribute('origin', this.href + '/{{slug}}') // the slug is replaced by sharer
	}
	addEventListener() {
		this.$actions.addEventListener('input', this.onChannelAction.bind(this))
	}

	onChannelAction({ detail }) {
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
				this.openDialog(detail)
			}
			console.log('channel action', detail)
		}
	}
	openDialog(name) {
		this.querySelector(`r4-dialog[name="${name}"]`).open()
	}

	render(dom) {
		this.append(dom)
	}
}
