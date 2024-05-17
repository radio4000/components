import {LitElement, html} from 'lit'
import {createSearchFilter} from '../libs/url-utils.js'

// Renders a search input, and fires @input event with a Supabase SDK search filter.
export default class R4SupabaseFilterSearch extends LitElement {
	static properties = {
		search: {type: String},
		placeholder: {type: String},
	}

	render() {
		return html`
			<form>
				<fieldset>
					<label>
						<legend>Search</legend>
						<input
							type="search"
							placeholder=${this.placeholder || 'search'}
							@input=${this.onInput}
							value=${this.search}
						/>
					</label>
				</fieldset>
			</form>
		`
	}

	async onInput(event) {
		event.preventDefault()
		event.stopPropagation()
		this.search = event.target.value
		this.dispatchEvent(
			new CustomEvent('input', {
				bubbles: false,
				detail: {filter: createSearchFilter(this.search), search: this.search},
			}),
		)
	}

	// extractSearchFilterValue(filter) {
	// 	return filter?.value.split(':')[0].split("'")[1]
	// }

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}
