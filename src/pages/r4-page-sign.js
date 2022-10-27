import page from 'page'

const template = document.createElement('template')
template.innerHTML = `
	<header>
		<h1></h1>
	</header>
	<main></main>
	<footer></footer>
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
		this.$title = this.querySelector('header h1')
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
		if (this.$main) {
			const $signForm = document.createElement(`r4-sign-${method}`)
			this.$main.append($signForm)
		}
		if (this.$title) {
			this.$title.innerText = `Sign ${method}`
		}
	}
	renderMethodSelection() {
		const $info = document.createElement('aside')
		$info.innerHTML = `
			<p>
				To use <r4-title></r4-title>, sign into your user account.
			</p>
			<r4-menu direction="row">
				<a href="/sign/up">up</a>
				<a href="/sign/in">in</a>
				<a href="/sign/out">out</a>
			</r4-menu>
		`
		this.$main && this.$main.append($info)
	}
}
