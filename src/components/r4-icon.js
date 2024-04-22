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
	connectedCallback() {
		this.replaceChildren(this.icon)
	}
}

const ICONS = {
	search: '🔍',
	map: '🗺️',
	map_position: '✵',
	globe: '🌍',
	dark: '🌘',
	light: '🌖',
	player_status: '♫',
	player_close: 'x',
	player_dock: '⌃',
	player_minimize: '⌄',
	player_fullscreen: '⛶', // ⌆
	follow: '☆',
	unfollow: '★',
}
