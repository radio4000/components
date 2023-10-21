import {LitElement, html} from 'lit'
/* import {sdk} from '@radio4000/sdk' */

export default class R4SupabaseFilterSearch extends LitElement {
	static properties = {
		search: {type: String, state: true},
		placeholder: {type: String},
	}

	// should be externilized in the sdk or a "postgrest filter lib"
	get filter() {
		return {
			column: 'fts',
			operator: 'textSearch',
			value: `'${this.search}':*`,
		}
	}
	set filter(data) {
		const search = this.getFilterSearch(data)
		this.search = search || ''
		return data
	}

	getFilterSearch(filter) {
		const search = filter?.value.split(':')[0].split("'")[1]
		return search
	}

	render() {
		return html`
			<form>
				<fieldset>
					<label>Search</label>
					<input
						type="search"
						placeholder=${this.placeholder || 'search'}
						@input=${this.onInput}
						value=${this.search}
					/>
				</fieldset>
			</form>
		`
	}
	async onInput() {
		event.preventDefault()
		event.stopPropagation()
		this.search = event.target.value
		const filter = this.search ? this.filter : null
		this.dispatchEvent(
			new CustomEvent('input', {
				bubbles: false,
				detail: filter,
			})
		)
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
