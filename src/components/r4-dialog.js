const template = document.createElement('template')
template.innerHTML = `
	<dialog>
		<slot name="close">
			<form method="dialog">
				<button>close</button>
			</form>
		</slot>
		<slot name="dialog"></slot>
	</dialog>
`

export default class R4Dialog extends HTMLElement {
	static get observedAttributes() {
		return ['visible']
	}

	get visible() {
		return this.getAttribute('visible') === 'true'
	}

	set visible(bool) {
		this.setAttribute('visible', bool)
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName, newVal) {
		if (['visible'].indexOf(attrName) > -1) {
			this.toggleDialog()
		}
	}

	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.append(template.content.cloneNode(true))
	}

	connectedCallback() {
		this.$dialog = this.shadowRoot.querySelector('dialog')
		this.$dialogSlot = this.shadowRoot.querySelector('slot[name="dialog"]')
		this.$close = this.shadowRoot.querySelector('slot[name="close"] button')

		this.$dialog.addEventListener('close', this.onClose.bind(this))
	}
	onClose() {
		this.visible = false
	}
	open() {
		this.visible = true
	}
	close() {
		this.visible = false
	}
	toggle() {
		this.visible = !this.visible
	}
	toggleDialog() {
		if (this.visible) {
			this.$dialog.showModal()
		} else {
			this.$close.click()
		}
	}
}
