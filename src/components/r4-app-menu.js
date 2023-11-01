import {LitElement, html} from 'lit'

export default class R4AppMenu extends LitElement {
	static properties = {
		href: {type: String},
		slug: {type: String},
		auth: {type: Boolean},
		// Used to set active link.
		path: {type: Boolean, state: true},
	}

	constructor() {
		super()

		// Set "path" on every navigation.
		window.navigation.addEventListener('navigate', (e) => {
			this.path = e.destination.url.replace(this.href, '').split('?')[0]
		})
	}

	get canAdd() {
		/* could just be "slug", menu has slug if "user" has channel */
		return this.auth && this.slug
	}

	render() {
		const {href, path} = this
		return html`
			<menu>
				<li>
					<a ?active=${path === '/'} href=${href + '/'}><r4-title size="small"></r4-title></a>
				</li>
				<li><a ?active=${path === '/explore'} href=${href + '/explore'}>Explore</a></li>
				<li><a ?active=${path === '/map'} href=${href + '/map'}>Map</a></li>
				${this.auth ? this.renderAuth() : this.renderNoAuth()}
				${this.canAdd ? this.renderAdd() : null}
				<li><a ?active=${path === '/settings'} href=${href + '/settings'}>Settings</a></li>
			</menu>
		`
	}
	renderNoAuth() {
		return html`
			<li><a ?active=${this.path === '/sign/up'} href=${this.href + '/sign/up'}>Sign up</a></li>
			<li><a ?active=${this.path === '/sign/in'} href=${this.href + '/sign/in'}>Sign in</a></li>
		`
	}
	renderAuth() {
		if (this.slug) {
			return html`<li>
				<a ?active=${this.path === `/${this.slug}`} href=${this.href + '/' + this.slug}>@${this.slug}</a>
			</li>`
		} else {
			return html`<li><a ?active=${this.path === '/new'} href=${this.href + '/new'}>New radio</a></li>`
		}
	}
	renderAdd() {
		return html`<li><a ?active=${this.path === '/add'} href=${this.href + '/add?slug=' + this.slug}>Add</a></li>`
	}
	createRenderRoot() {
		return this
	}
}
