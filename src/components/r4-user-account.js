import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

const THEMES = ['os', 'dark', 'light']

export default class R4UserAccount extends LitElement {
	static properties = {
		account: {type: Object, state: true},
	}
	async saveTheme(value) {
		if (!value) return
		if (this.account) {
			/* the account ID is the user ID (relationship) */
			await sdk.supabase.from('accounts').update({theme: value}).eq('id', this.account.id)
		}
	}
	get currentTheme() {
		return this.account?.theme || THEMES[0]
	}

	render() {
		return html`
			<section>
				<h3>Theme</h3>
				${this.account ? this.renderThemes() : 'Sign-in to use themes'}
			</section>
		`
	}
	renderThemes() {
		return html`
			<select @input=${this.onUpdateTheme} selected=${this.currentTheme}>
				<option disabled="true">${this.currentTheme}</option>
				${THEMES.map(this.renderThemeOption.bind(this))}
			</select>
		`
	}
	renderThemeOption(theme) {
		return html` <option value=${theme}>${theme}</option> `
	}
	onUpdateTheme({target}) {
		this.saveTheme(target.value)
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
