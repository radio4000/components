import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

const THEMES = ['radio4000/theme-default', 'radio4000/theme-jellybeans']
const COLOR_SCHEMES = ['os', 'light', 'dark']

export default class R4UserAccount extends LitElement {
	static properties = {
		/* the account ID is the user ID (relationship) */
		account: {type: Object, state: true},
	}
	get currentTheme() {
		return this.account?.theme || THEMES[0]
	}

	get prefersDark() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}

	/* save functions */
	async saveTheme(value) {
		if (!value) return
		if (this.account) {
			await sdk.supabase.from('accounts').update({theme: value}).eq('id', this.account.id)
		}
	}
	async saveColorScheme(value) {
		if (!value) return
		if (this.account) {
			await sdk.supabase.from('accounts').update({color_scheme: value}).eq('id', this.account.id)
		}
	}

	render() {
		return html`
			<section>
				<h3>Theme</h3>
				${this.account ? this.renderThemes() : 'Sign-in to use themes'}
			</section>
			<section>
				<h3>Color Scheme</h3>
				${this.account ? this.renderColorScheme() : 'Sign-in to use color schemes'}
			</section>
		`
	}
	renderThemes() {
		return html`
			<select @input=${this.onTheme}>
				<option disabled="true">${this.currentTheme}</option>
				${THEMES.map(this.renderThemeOption.bind(this))}
			</select>
		`
	}
	renderThemeOption(theme) {
		return html` <option value=${theme} ?selected=${this.currentTheme === theme}>${theme}</option> `
	}
	renderColorScheme() {
		return COLOR_SCHEMES.map((scheme, index) => {
			// reset the color scheme value for "os" scheme
			const value = index === 0 ? '' : scheme
			const disabled = this.account.color_scheme === scheme
			return html` <button value=${scheme} @click="${this.onColorScheme}" ?disabled=${disabled}>${scheme}</button> `
		})
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}

	/* events handle */
	onTheme({target}) {
		this.saveTheme(target.value)
	}
	onColorScheme({target}) {
		this.saveColorScheme(target.value)
	}
	onSize({target}) {
		this.saveSize(target.value)
	}
}
