export default class R4Title extends HTMLElement {
	static get observedAttributes() {
		return ['size']
	}
	get text() {
		return this.getAttribute('text') || 'radio4000'
	}
	get textSmall() {
		return this.getAttribute('text') || 'r4'
	}
	get small() {
		return this.getAttribute('small') === 'true'
	}

	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (
			['text', 'text-small', 'size'].indexOf(attrName) > -1
		) {
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
