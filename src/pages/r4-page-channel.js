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

		this.addAttributes()
		this.addEventListener($dom)
		this.render($dom)
	}
	addAttributes() {
		this.$channel.setAttribute('slug', this.slug)
		this.$actions.setAttribute('slug', this.slug)
		this.$tracks.setAttribute('channel', this.slug)
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
				page(`/add?channel=${this.slug}&url=https://example.org`)
			}
			console.log('channel action', detail)
		}
	}

	render(dom) {
		this.append(dom)
	}
}
