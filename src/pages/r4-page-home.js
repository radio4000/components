/* the app template */
const template = document.createElement('template')
template.innerHTML = `
	<header>
		<h1><r4-title></r4-title></h1>
		<p>
			Welcome to <a href="/"><r4-title small="true"></r4-title></a>!
		</p>
	</header>
	<section>
		<menu>
			<li>
				Select a <r4-title small="true"></r4-title> channel to play its content.
			</li>
			<li>
				Start <a href="/explore">exploring channels</a> to discover new content.
			</li>
		</menu>
	</section>
`

export default class R4PageHome extends HTMLElement {
	connectedCallback() {
		this.append(template.content.cloneNode(true))
	}
}
