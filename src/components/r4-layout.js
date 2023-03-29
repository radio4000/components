import sdk from '@radio4000/sdk'

const template = document.createElement('template')
template.innerHTML = `
	<slot name="header"></slot>
	<slot name="main"></slot>
	<slot name="player"></slot>
`

export default class R4Layout extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.append(template.content.cloneNode(true))
		this.$header = this.shadowRoot.querySelector('slot[name="header"]')
		this.$main = this.shadowRoot.querySelector('slot[name="main"]')
		this.$player = this.shadowRoot.querySelector('slot[name="player"]')
	}

	connectedCallback() {
		this.render()
	}
	render() {
		if (!this.$header.assignedElements().length) {
			this.renderHeader()
		}
		if (!this.$main.assignedElements().length) {
			this.renderMain()
}
		if (!this.$player.assignedElements().length) {
			this.renderPlayer()
		}
	}

	renderHeader() {
		this.$header.innerHTML = ''
		const $title = document.createElement('r4-title')
		this.$header.append($title)
	}

	renderMain() {}

	renderPlayer() {}
}
