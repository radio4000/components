import {LitElement, html} from 'lit'

export default class R4AppMenu extends LitElement {
	static properties = {
		href: {type: String},
		slug: {type: String},
		auth: {type: Boolean}
	}

	get canAdd() {
		/* could just be "slug", menu has slug if "user" has channel */
		return this.auth && this.slug
	}

	get activePath() {
		const url = new URL(window.location)
		return url.pathname.replace(this.href.replace(url.origin, ''), '')
	}

	render() {
		console.log('app-menu', this.activePath)
		return html`
			<menu>
				<li>active? ${this.activePath}</li>
				<li>
					<a ?active=${this.activePath === '/'} href=${this.href + '/'}><r4-title size="small"></r4-title></a>
				</li>
				<li><a ?active=${this.activePath === '/explore'} href=${this.href + '/explore'}>Explore</a></li>
				<li><a ?active=${this.activePath === '/map'} href=${this.href + '/map'}>Map</a></li>
				${!this.auth ? this.renderNoAuth() : this.renderAuth()}
				${this.canAdd ? this.renderAdd() : null}
				<li><a ?active=${this.activePath === '/settings'} href=${this.href + '/settings'}>Settings</a></li>
			</menu>
		`
	}
	renderNoAuth() {
		return html`
			<li><a ?active=${this.activePath === '/sign/up'} href=${this.href + '/sign/up'}>Sign up</a></li>
			<li><a ?active=${this.activePath === '/sign/in'} href=${this.href + '/sign/in'}>Sign in</a></li>
		`
	}
	renderAuth() {
		if (this.slug) {
			return html`<li><a ?active=${this.activePath === `/${this.slug}`} href=${this.href + '/' + this.slug}>@${this.slug}</a></li>`
		} else {
			return html`<li><a ?active=${this.activePath === '/new'} href=${this.href + '/new'}>New radio</a></li>`
		}
	}
	renderAdd() {
		return html`<li><a ?active=${this.activePath === '/add'} href=${this.href + '/add?slug=' + this.slug}>Add</a></li>`
	}
	createRenderRoot() {
		return this
	}
}

