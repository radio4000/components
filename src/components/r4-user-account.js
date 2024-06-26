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
	async onForm(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
	render() {
		return html`
			<article>${this.account ? this.renderThemes() : 'Sign-in to use themes'}</article>
			<article>${this.account ? this.renderColorSchemes() : 'Sign-in to use color schemes'}</article>
		`
	}
	renderThemes() {
		return html`
			<form @submit=${this.onForm}>
				<fieldset>
					<legend>
						<label for="theme"> Theme </label>
					</legend>
					<select @input=${this.onTheme} id="theme">
						<option disabled="true">${this.currentTheme}</option>
						${THEMES.map(this.renderThemeOption.bind(this))}
					</select>
				</fieldset>
			</form>
		`
	}
	renderThemeOption(theme) {
		return html` <option value=${theme} ?selected=${this.currentTheme === theme}>${theme}</option> `
	}
	renderColorSchemes() {
		return html`
			<form @submit=${this.onForm}>
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
