export default class R4Title extends HTMLElement {
	static get observedAttributes() {
		return ['size']
	}
	get text() {
		return this.hasAttribute('small') ? 'R4' : 'Radio4000'
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (['small'].indexOf(attrName) > -1) {
			this.render()
		}
	}
	connectedCallback() {
		this.render()
	}
	render() {
		this.innerHTML = ''
		if (this.small) {
			this.innerText = this.textSmall
		} else {
			this.innerText = this.text
		}
	}
}
