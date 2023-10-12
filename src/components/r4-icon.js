export default class R4Icon extends HTMLElement {
	static get observedAttributes() {
		return ['name']
	}
	get name() {
		return this.getAttribute('name')
	}
	get icon() {
		const i = ICONS[this.name] || {}
		return i.emoji
	}
	attributeChangedCallback(attrName) {
		this.render()
	}
	connectedCallback() {
		this.render()
	}
	render() {
		this.innerHTML = ''
		console.log(this.icon, this.name)
		if (this.icon) {
			const $icon = document.createElement('span')
			$icon.setAttribute('title', `${this.name} icon`)
			$icon.innerText = this.icon
			this.append($icon)
		}
	}
}

const ICONS = {
	search: {
		emoji: '🔍',
	},
	map: {
		emoji: '🗺️',
	},
	globe: {
		emoji: '🌍',
	},
	dark: {
		emoji: '🌘',
	},
	light: {
		emoji: '🌖',
	},
}
