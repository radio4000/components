import {LitElement, html, nothing} from 'lit'

/**
 * The primary menu for <r4-app>
 */
export default class R4AppMenu extends LitElement {
	static properties = {
		href: {type: String},
		slug: {type: String},
		/** If set to true, renders different menu items */
		auth: {type: Boolean},
		/** Used to set active link	*/
		path: {type: Boolean, state: true},
	}

	constructor() {
		super()
		// Set "path" on every navigation.
		window?.navigation?.addEventListener('navigate', (e) => {
			this.path = e.destination.url.replace(this.href, '').split('?')[0]
		})
	}

	get canAdd() {
		/* could just be "slug", menu has slug if "user" has channel */
		return this.auth && this.slug
	}

	isCurrent(path) {
		return this.path === path ? 'page' : nothing
	}

	render() {
		const {href, path} = this
		return html`
			<menu>
				<li>
					<a aria-current=${this.isCurrent('/')} href=${href + '/'}><r4-title size="small"></r4-title></a>
				</li>
				<li>${this.auth ? this.renderAuth() : this.renderNoAuth()}</li>
				<li>${this.canAdd ? this.renderAdd() : null}</li>
				<li><a aria-current=${this.isCurrent('/explore')} href=${href + '/explore'}>Explore</a></li>
				<li><a aria-current=${this.isCurrent('/map')} href=${href + '/map'}>Map</a></li>
				<li><a aria-current=${this.isCurrent('/settings')} href=${href + '/settings'}>Settings</a></li>
			</menu>
		`
	}
	renderNoAuth() {}
	renderAuth() {
		if (this.slug) {
			return html`
				<a aria-current=${this.isCurrent(`/${this.slug}`)} href=${this.href + '/' + this.slug}>@${this.slug}</a>
			`
		} else {
			return html`<a aria-current=${this.isCurrent('/new')} href=${this.href + '/new'}>New radio</a>`
		}
	}
	renderAdd() {
		return html`<a aria-current=${this.isCurrent('/add')} href=${this.href + '/add?slug=' + this.slug}>Add</a>`
	}
	createRenderRoot() {
		return this
	}
}
