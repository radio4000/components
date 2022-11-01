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
	</aside>
`

export default class R4PageHome extends HTMLElement {
	get slug() {
		return this.getAttribute('slug')
	}
	get href() {
		return this.getAttribute('href')
	}
	connectedCallback() {
		const $dom = template.content.cloneNode(true)
		this.$channel = $dom.querySelector('r4-channel')
		this.$actions = $dom.querySelector('r4-channel-actions')
		this.$tracks = $dom.querySelector('r4-tracks')
		this.$channelUpdate = $dom.querySelector('r4-channel-update')
		this.$channelDelete = $dom.querySelector('r4-channel-delete')

		this.addAttributes()
		this.addEventListener($dom)
		this.render($dom)
	}
	addAttributes() {
		this.$channel.setAttribute('slug', this.slug)
		this.$actions.setAttribute('slug', this.slug)
		this.$tracks.setAttribute('channel', this.slug)
		this.$channelUpdate.setAttribute('slug', this.slug)
		this.$channelDelete.setAttribute('slug', this.slug)
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

			if (['update', 'delete'].indexOf(detail) > -1) {
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
