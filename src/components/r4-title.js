const DEFAULT_SIZE = 'default'
const SIZES = {
	[DEFAULT_SIZE]: 'Radio4000',
	small: 'R4',
	medium: 'R4000',
}

/**
 * Displays Radio4000 title in different sizes
 */
export default class R4Title extends HTMLElement {
	static get observedAttributes() {
		return ['size']
	}
	get size() {
		const attr = this.getAttribute('size')
		if (this.sizeNames.indexOf(attr) > -1) {
			return attr
		} else {
			return DEFAULT_SIZE
		}
	}
	get sizeNames() {
		return Object.keys(SIZES)
	}
	set size(size) {
		if (this.sizeNames.indexOf(size) > -1) {
			this.setAttribute('size', size)
		} else {
			this.setAttribute('size', DEFAULT_SIZE)
		}
	}
	get text() {
		return SIZES[this.size]
	}
	/* if the attribute changed, re-render */
	attributeChangedCallback(attrName) {
		if (attrName === 'size') {
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
