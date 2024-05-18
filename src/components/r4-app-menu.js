import {LitElement, html, nothing} from 'lit'

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
		// Set "path" on every navigation.
		window?.navigation?.addEventListener('navigate', (e) => {
			this.path = e.destination.url.replace(this.href, '').split('?')[0]
		})
	}
	isCurrent(path) {
		return this.path === path ? 'page' : nothing
	}
	render() {
		const {href, path} = this
		return html`
			<menu>
				<li>
					<a aria-current=${this.isCurrent('/')} href=${href + '/'}>Home</a>
				</li>
				<li><a aria-current=${this.isCurrent('/explore')} href=${href + '/explore'}>Explore</a></li>
				<li><a aria-current=${this.isCurrent('/map')} href=${href + '/map'}>Map</a></li>
				<li><a aria-current=${this.isCurrent('/settings')} href=${href + '/settings'}>Settings</a></li>
			</menu>
		`
	}
}
