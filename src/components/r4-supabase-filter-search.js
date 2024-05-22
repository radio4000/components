import {LitElement, html} from 'lit'
import {createSearchFilter} from '../libs/url-utils.js'

/** Renders a search input
 * @fires input - in event.details find the search value and Supabase SDK filter. */
export default class R4SupabaseFilterSearch extends LitElement {
	static properties = {
		value: {type: String},
		placeholder: {type: String},
	}

	constructor() {
		super()
		this.placeholder = 'Search'
	}

	render() {
		return html`
			<form>
				<fieldset>
					<label>
						<legend>Search</legend>
						<input type="search" placeholder=${this.placeholder} value=${this.value} @input=${this.onInput} />
					</label>
				</fieldset>
			</form>
		`
	}

	async onInput(event) {
		event.preventDefault()
		event.stopPropagation()
		this.value = event.target.value
		this.dispatchEvent(
			new CustomEvent('input', {
				bubbles: false,
				detail: {
					filter: createSearchFilter(this.value),
					search: this.value,
				},
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
