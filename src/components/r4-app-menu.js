import {LitElement, html} from 'lit'

export default class R4AppMenu extends LitElement {
	static properties = {
		href: {type: String},
		slug: {type: String},
		auth: {type: Boolean},
	}

	get canAdd() {
		/* could just be "slug", menu has slug if "user" has channel */
		return this.auth && this.slug
	}

	render() {
		return html`
			<menu>
				<li>
					<a href=${this.href + '/'}><r4-title size="small"></r4-title></a>
				</li>
				<li><a href=${this.href + '/search'}>Search</a></li>
				<li><a href=${this.href + '/explore'}>Explore</a></li>
				<li><a href=${this.href + '/map'}>Map</a></li>
				<li><a href=${this.href + '/settings'}>Settings</a></li>
				${!this.auth ? this.renderNoAuth() : this.renderAuth()} ${this.canAdd ? this.renderAdd() : null}
			</menu>
		`
	}
	renderNoAuth() {
		return html`
			<li><a href=${this.href + '/sign/up'}>Sign-up</a></li>
			<li><a href=${this.href + '/sign/in'}>Sign-in</a></li>
		`
	}
	renderAuth() {
		if (this.slug) {
			return html`<li><a href=${this.href + '/' + this.slug}>@${this.slug}</a></li>`
		} else {
			return html`<li><a href=${this.href + '/new'}>New radio</a></li>`
		}
	}
	renderAdd() {
		return html`<li><a href=${this.href + '/add?slug=' + this.slug}>Add</a></li>`
	}
	createRenderRoot() {
		return this
	}
}
