import sdk from '@radio4000/sdk'

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
	set url(str) {
		if (str) {
			this.setAttribute('url', str)
		} else {
			this.removeAttribute('url')
		}
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
		const { data } = await sdk.findChannelBySlug(this.channel)
		if (data && data.id) {
			return data.id
		}
	}

	/* when channel slected or URL params change,
		 update the attributes of the create track form */
	updateAttributes() {
		if (this.channelId) {
			this.$trackCreate.setAttribute('channel-id', this.channelId)
		} else {
			this.$trackCreate.removeAttribute('channel-id')
		}
		if (this.url) {
				this.$trackCreate.setAttribute('url', this.url)
		} else {
			this.$trackCreate.removeAttribute('url')
		}
	}

	onChannelSelect({ detail }) {
		const { channel } = detail
		if (channel) {
			this.channel = channel.slug
		}
	}
	onTrackCreate({detail}) {
		console.log('track submit', detail)
		if (detail.data) {
			/* remove the url, because added ? */
			this.url = null
			/* set the channel id attribute (since the form cleared on success) */
			this.updateAttributes()
			this.focus()
		}
	}
}
