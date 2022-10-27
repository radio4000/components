/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		<r4-channel slug></r4-channel>
	</header>
	<main>
		<r4-tracks channel pagination="true"></r4-tracks>
	</main>
`

export default class R4PageHome extends HTMLElement {
	/* passed from the route */
	static get observedAttributes() {
		return ['slug']
	}
	get slug() {
		return this.getAttribute('slug')
	}
	connectedCallback() {
		this.$channel = template.content.querySelector('r4-channel')
		this.$tracks = template.content.querySelector('r4-tracks')

		this.$channel.setAttribute('slug', this.slug)
		this.$tracks.setAttribute('channel', this.slug)

		this.render()
	}
	render() {
		this.append(template.content.cloneNode(true))
	}
}
