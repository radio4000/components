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
	connectedCallback() {
		this.append(template.content.cloneNode(true))
	}
}
