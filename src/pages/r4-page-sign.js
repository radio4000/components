import page from 'page'

const template = document.createElement('template')
template.innerHTML = `
	<header>
		<r4-menu direction="row">
			<h1>Sign</h1>
			<a href="/sign/up">up</a>
			<a href="/sign/in">in</a>
			<a href="/sign/out">out</a>
		</r4-menu>
	</header>
	<main></main>
	<footer>
		<r4-menu direction="row">
			<r4-title></r4-title>
			<r4-favicon></r4-favicon>
		</r4-menu>
	</footer>
`

export default class R4PageSign extends HTMLElement {
	static get observedAttributes() {
		return ['method']
	}
	get method() {
		return this.getAttribute('method')
	}
	attributeChangedCallback(attrName, newVal) {
		if (attrName === 'method') {
			this.renderMethodPage(newVal)
		}
	}
	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$main = this.querySelector('main')
		this.render(this.method)
	}
	render(method) {
		this.$main.innerHTML = ''
		if (method) {
			this.renderMethodPage(method)
		} else {
			this.renderMethodSelection()
		}
	}
	renderMethodPage(method) {
		const $signForm = document.createElement(`r4-sign-${method}`)
		this.$main && this.$main.append($signForm)
	}
	renderMethodSelection() {
		const $info = document.createElement('p')
		$info.innerText = '↑ What would you like to do?'
		this.$main && this.$main.append($info)
	}
}
