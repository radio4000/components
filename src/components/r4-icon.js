/**
 * This element can be used to render a predefined icon.
 * Set the `name` attribute and the element will update the `icon` attribute.
 */
export default class R4Icon extends HTMLElement {
	ICONS = {
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
		remove: 'x',
	}

	static get observedAttributes() {
		return ['name']
	}
	get name() {
		return this.getAttribute('name')
	}
	get icon() {
		return this.ICONS[this.name] || ''
	}
	connectedCallback() {
		this.setAttribute('icon', this.icon)
	}
}
