/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		<h1>Welcome to <r4-title small="true"></r4-title></h1>
		<p>
			Select a <r4-title small="true"></r4-title> channel to play its content.
		</p>
	</header>
	<section>
		<menu>
			<li>
				Start exploring <a href="channels">channels</a> and discover new content.
			</li>
		</menu>
	</section>
`

export default class R4PageHome extends HTMLElement {
	connectedCallback() {
		this.append(template.content.cloneNode(true))
	}
}
