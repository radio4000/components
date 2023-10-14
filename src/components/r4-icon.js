export default class R4Icon extends HTMLElement {
	static get observedAttributes() {
		return ['name']
	}
	get name() {
		return this.getAttribute('name')
	}
	get icon() {
		return ICONS[this.name] || ''
	}
	attributeChangedCallback() {
		this.render()
		this.renderAttr()
	}
	connectedCallback() {
		this.render()
	}
	render() {
		this.innerHTML = ''
		this.innerText = this.icon
	}
	renderAttr() {
		if (this.name) {
			this.setAttribute('title', `${this.name} icon`)
		} else {
			this.removeAttribute('title')
		}
	}
}

const ICONS = {
	search: '🔍',
	map: '🗺️',
	map_position: '✵',
	globe: '🌍',
	dark: '🌘',
	light: '🌖',
}
