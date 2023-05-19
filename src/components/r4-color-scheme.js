import {LitElement, html, css} from 'lit'
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
	}

	static styles = css`
		menu {
			margin: 0;
		}
	`

	// The attribute to set on <html> element
	attrName = 'data-color-scheme'

	connectedCallback() {
		super.connectedCallback()
		if (this.user) this.restoreTheme()
	}

	// Restores theme from user account.
	async restoreTheme() {
		const {data} = await sdk.supabase.from('accounts').select('theme').eq('id', this.user.id).single()
		this.save(data?.theme || '')

		// If there is no account, it is time to create it.
		if (!data) {
			const res = await sdk.supabase.from('accounts').insert({id: this.user.id}).single()
			console.log('inserted new account', res)
		}
	}

	// Sets the theme attribute and persists it to db.
	async save(value) {
		this.theme = value
		document.documentElement.setAttribute(this.attrName, value)
		localStorage.setItem('r4.theme', value)
		if (this.user) {
			const update = await sdk.supabase.from('accounts').update({theme: value}).eq('id', this.user.id)
			console.log('updated account theme', update)
		}
	}

	render() {
		return html`
			<button ?aria-selected=${this.theme === 'light'} @click=${() => this.save('light')}>🌕 Always light</button>
			<button ?aria-selected=${this.theme === 'dark'} @click=${() => this.save('dark')}>🌑 Always dark</button>
			<button ?aria-selected=${this.theme === ''} @click=${() => this.save('')}>🌗 Same as OS</button>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
