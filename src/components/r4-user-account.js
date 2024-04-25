import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'
import {THEMES, COLOR_SCHEMES} from '../libs/appearance.js'

export default class R4UserAccount extends LitElement {
	static properties = {
		/* the account ID is the user ID (relationship) */
		account: {type: Object, state: true},
	}

	get currentTheme() {
		return this.account?.theme || THEMES[0]
	}

	/* save functions */
	async saveTheme(value) {
		if (!value) return
		if (this.account) {
			const {error} = await sdk.supabase.from('accounts').update({theme: value}).eq('id', this.account.id)
		}
	}
	async saveColorScheme(value) {
		if (!value) return
		if (this.account) {
			const {error} = await sdk.supabase.from('accounts').update({color_scheme: value}).eq('id', this.account.id)
		}
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
	render() {
		return html`
			<section>${this.account ? this.renderThemes() : 'Sign-in to use themes'}</section>
			<section>${this.account ? this.renderColorSchemes() : 'Sign-in to use color schemes'}</section>
		`
	}
	renderThemes() {
		return html`
			<form>
				<fieldset>
					<label>
						<legend>Theme</legend>
						<select @input=${this.onTheme}>
							<option disabled="true">${this.currentTheme}</option>
							${THEMES.map(this.renderThemeOption.bind(this))}
						</select>
					</label>
				</fieldset>
			</form>
		`
	}
	renderThemeOption(theme) {
		return html` <option value=${theme} ?selected=${this.currentTheme === theme}>${theme}</option> `
	}
	renderColorSchemes() {
		return html`
			<form>
				<fieldset>
					<legend>Color scheme</legend>
					${COLOR_SCHEMES.map(this.renderColorScheme.bind(this))}
				</fieldset>
			</form>
		`
	}
	renderColorScheme(scheme, index) {
		// reset the color scheme value for "os" scheme
		// const value = index === 0 ? '' : scheme
		const disabled = this.account.color_scheme === scheme
		return html` <button value=${scheme} @click="${this.onColorScheme}" ?disabled=${disabled}>${scheme}</button> `
	}
	/* events handler */
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
