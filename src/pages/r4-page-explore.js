import R4Page from './r4-page.js'

/* the app template */
const pageTemplate = document.createElement('template')
pageTemplate.innerHTML = `
	<header>
		<h1>Explore</h1>
		<p>
			All <r4-title ></r4-title> channels.
		</p>
	</header>
	<section>
		<r4-channels pagination="true" limit="3"></r4-channels>
	</section>
`

export default class R4PageHome extends R4Page {
	template = pageTemplate
	/* an origin with a {{slug}} token, replaced by the r4-channel,
		 to link to our app's channel page */
	get channelOrigin() {
		return `${this.href}/{{slug}}`
	}
	connectedCallback() {
		this.$page = this.template.content.cloneNode(true)
		this.setupAttributes(this.$page)
		this.render()
	}
	setupAttributes(dom) {
		const $channels = dom.querySelector('r4-channels')
		if (this.channelOrigin) {
			$channels.setAttribute('origin', this.channelOrigin)
		}
	}
}
