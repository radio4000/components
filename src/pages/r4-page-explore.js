/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		<h1>Explore channels</h1>
		<p>
			All <r4-title ></r4-title> channels.
		</p>
	</header>
	<section>
		<r4-list-channels></r4-list-channels>
	</section>
`

export default class R4PageHome extends HTMLElement {
	connectedCallback() {
		this.append(template.content.cloneNode(true))
	}
}
