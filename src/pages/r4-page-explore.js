/* the app template */
const template = document.createElement('template')
template.innerHTML = `
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

export default class R4PageHome extends HTMLElement {
	/* an origin with a {{slug}} token, replaced by the r4-channel,
		 to link to our app's channel page */
	get channelOrigin() {
		if (this.href) {
			return `/{{slug}}`
		}
	}
	connectedCallback() {
		this.setupAttributes(template.content)
		this.render()
	}
	setupAttributes(dom) {
		const $channels = dom.querySelector('r4-channels')
		if (this.channelOrigin) {
			$channels.setAttribute('origin', this.channelOrigin)
		}
	}
	render() {
		this.append(template.content.cloneNode(true))
	}
}
