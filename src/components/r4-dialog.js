const template = document.createElement('template')
template.innerHTML = `
	<dialog part="dialog">
		<slot name="close">
			<form method="dialog" part="form">
				<button part="button" formmethod="dialog">Close</button>
			</form>
		</slot>
		<slot name="dialog"></slot>
	</dialog>
`

/**
 * Modal dialog with backdrop click to close and customizable slots
 * @fires close - Fired when dialog closes, contains {visible: boolean} in detail
 */
export default class R4Dialog extends HTMLElement {
	static get observedAttributes() {
		return ['visible']
	}

	get visible() {
		return this.hasAttribute('visible')
	}

	set visible(bool) {
		bool ? (
			this.setAttribute('visible', 'true')
		) : (
			this.removeAttribute('visible')
		)
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
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

		this.$dialog.addEventListener('click', this.onBackdropClick.bind(this))
		this.$dialog.addEventListener('close', this.onClose.bind(this))
	}
	/* dialog methods */
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

	/* event handlers */
	onBackdropClick(event) {
		/* only close if the target is r4-dialog,
			 not its children (except the close button)
			 https://stackoverflow.com/questions/25864259/how-to-close-the-new-html-dialog-tag-by-clicking-on-its-backdrop
		 */
		const rect = this.$dialog.getBoundingClientRect()
		const isInDialog = (
			rect.top <= event.clientY
			&& event.clientY <= rect.top + rect.height
			&& rect.left <= event.clientX
			&& event.clientX <= rect.left + rect.width
		)
		if (!isInDialog) {
			this.close()
		}
	}
	/* when it is closed, for example with js, or a button in a form */
	onClose() {
		this.visible = false
		const closeEvent = new CustomEvent('close', {
			bubbles: true,
			detail: {
				visible: this.visible
			}
		})
		this.dispatchEvent(closeEvent)
	}
}
