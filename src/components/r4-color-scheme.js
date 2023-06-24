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

/* Renders a grid of the colors for the Jellybeans theme */
class R4ThemeJellybeans extends LitElement {
	static properties = {
		tints: {type: Array},
		shades: {type: Number},
	}

	static styles = css`
		ul {
			list-style: none;
			padding: 0;
			display: flex;
			flex-flow: row nowrap;
			margin: 0;
		}
		li {
			display: flex;
			place-items: center;
			justify-content: center;
			width: calc(var(--s) * 3);
			min-height: calc(var(--s) * 3);
			flex: 1;
			font-size: 12px;
		}
		[hidden] {
			display: none;
		}
	`

	generateColors() {
		const colors = {}
		for (const tint of this.tints) {
			colors[tint] = []
			for (let [i] of Array(this.shades).entries()) {
				i = i + 1
				colors[tint].push(`--c-${tint}${i}`)
			}
		}
		this.colors = colors
		console.log(this.colors)
	}

	constructor() {
		super()
		if (!this.tints) this.tints = ['gray', 'red', 'green', 'blue', 'yellow']
		if (!this.shades) this.shades = 9
		this.generateColors()
	}

	render() {
		return html`
			${Object.entries(this.colors).map(
				([color, shades]) => html`
					<ul>
						${shades.map(
							(shade) => html`<li style="background-color: var(${shade})">${shade.replace('--c-', '')}</li>`
						)}
					</ul>
					<ul hidden>
						${shades.map((shade) => html`<li style="color: var(${shade})">${shade.replace('--c-', '')}</li>`)}
					</ul>
				`
			)}
		`
	}
}

customElements.define('r4-theme-jellybeans', R4ThemeJellybeans)

