import {LitElement, html, nothing} from 'lit'
import {PathTrackerController} from '../libs/path-tracker-controller.js'

/**
 * The primary menu for <r4-app>
 */
export default class R4AppMenu extends LitElement {
	createRenderRoot() {
		return this
	}

	static properties = {
		href: {type: String},
		path: {type: String, state: true},
	}

	constructor() {
		super()

		this.href = ''
		this.path = ''

		new PathTrackerController(this)

		// Set "path" on every navigation.
		window?.navigation?.addEventListener('navigate', (e) => {
			this.path = e.destination.url.replace(this.href, '').split('?')[0]
		})
	}

	/** @param {string} path */
	isCurrent(path) {
		return this.path === path ? 'page' : nothing
	}

	render() {
		const {href} = this
		return html`
			<menu>
				<li>
					<a aria-current=${this.isCurrent('/')} href=${href + '/'} title="Use CTRL/CMD+K to open the command menu"
						>Dashboard</a
					>
				</li>
				<li><a aria-current=${this.isCurrent('/explore')} href=${href + '/explore'}>Explore</a></li>
				<li><a aria-current=${this.isCurrent('/map')} href=${href + '/map'}>Map</a></li>
			</menu>
		`
	}
}
