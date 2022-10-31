import {readChannel} from '@radio4000/sdk'

/* the page template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		Adding to: <r4-user-channels-select></r4-user-channels-select>
	</header>
	<main>
		<r4-track-create></r4-track-create>
	</main>
`

export default class R4PageAdd extends HTMLElement {
	static get observedAttributes() {
		return ['url', 'channel', 'href']
	}
	/* track url to be added */
	get url() {
		return this.getAttribute('url')
	}
	/* selected channel slug, to add track to */
	get channel() {
		return this.getAttribute('channel')
	}
	set channel(slug) {
		this.setAttribute('channel', slug)
	}
	/* application href for links */
	get href() {
		return this.getAttribute('href')
	}

	attributeChangedCallback(attrName) {
		if ('channel' === attrName) {
			this.init()
		}
	}

	async connectedCallback() {
		const $dom = template.content.cloneNode(true)
		this.$channelsSelect = $dom.querySelector('r4-user-channels-select')
		this.$channelsSelect.addEventListener('input', this.onChannelSelect.bind(this))
		this.$trackCreate = $dom.querySelector('r4-track-create')
		this.$trackCreate.addEventListener('submit', this.onTrackCreate.bind(this))

		if (this.channel) {
			this.$channelsSelect.setAttribute('channel', this.channel)
			/* await this.init() */
		}
		this.append($dom)
	}

	/* init the page data and dom */
	async init() {
		this.channelId = await this.findSelectedChannel()
		this.updateAttributes()
	}

	/* find the current channel id we want to add to */
	async findSelectedChannel() {
		const { data } = await readChannel(this.channel)
		if (data && data.id) {
			return data.id
		}
	}

	updateAttributes() {
		this.$trackCreate.setAttribute('channel-id', this.channelId)
	}

	addEventListener() {
	}

	onChannelSelect({ detail }) {
		const { channel } = detail
		if (channel) {
			this.channel = channel.slug
		}
	}
	onTrackCreate({detail}) {
		console.log('track submit', detail)
	}
}
