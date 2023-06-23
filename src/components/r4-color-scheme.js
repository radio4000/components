import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

/**
 * Renders controls to set your prefered color scheme
 * If the `user` property is set, settings will be persisted to Supabase.
 */
export default class R4ColorScheme extends LitElement {
	static properties = {
		user: {type: Object, state: true},
		account: {type: Object, state: true},
		theme: {type: String, state: true},
		themes: {type: Array, state: true},
	}

	// The attribute to set on <html> element
	attrName = 'color-scheme'

	constructor() {
		super()
		this.themes = ['os', 'dark', 'light']
	}

	connectedCallback() {
		super.connectedCallback()
		this.restoreTheme()
	}

	// Restores theme from user account.
	async restoreTheme() {
		if (!this.user) return
		const {data} = await sdk.supabase.from('accounts').select('theme').eq('id', this.user.id).single()
		if (data && !data.theme) {
			const t = document.querySelector('r4-app').getAttribute('color-scheme')
			this.save(t)
		} else {
			this.save(data?.theme)
		}
		// If there is no account, it is time to create it.
		if (!data) {
			await sdk.supabase.from('accounts').insert({id: this.user.id}).single()
		}
	}

	// Sets the theme attribute and persists it to db.
	async save(value) {
		if (!value) return
		this.theme = value
		this.closest('r4-app').setAttribute(this.attrName, value)
		localStorage.setItem('r4.theme', value)
		if (this.user) {
			await sdk.supabase.from('accounts').update({theme: value}).eq('id', this.user.id)
		}
	}

	render() {
		return this.themes.map((name) => {
			const selected = this.theme === name
			return html`
				<button ?disabled=${selected} ?aria-selected=${selected} @click=${() => this.save(name)}>${name}</button>
			`
		})
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
