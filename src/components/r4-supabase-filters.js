import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

const {supabaseOperators} = sdk.browse
import dbSchema from '../libs/db-schemas.js'
const {tables} = dbSchema

/*
	 supabase-filters
	 to manage "filters" applied by the supabase sdk on a `supabase.from()`
 */
export default class R4SupabaseFilters extends LitElement {
	static properties = {
		table: {type: String, reflect: true},
		filters: {type: Array, reflect: true, state: true},
	}

	constructor() {
		super()
		this.table = ''
		this.filters = []
	}

	updated(attr) {
		/* always update the list when any attribute change
			 for some attribute, first clear the existing search query */
		if (attr.get('filters')) this.onFilters()
	}

	async onFilters() {
		/* if (!this.table) return */
		const filtersEvent = new CustomEvent('filters', {
			bubbles: true,
			detail: this.filters,
		})
		this.dispatchEvent(filtersEvent)
	}

	onFormSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	/* create a new filter with "sane defaults" */
	addFilter() {
		const newFilter = {
			operator: this.filters?.at(0)?.operator || supabaseOperators[0],
			column: this.filters?.at(0)?.column || tables[this.table].columns[0],
			value: '',
		}
		const filters = this.filters || []
		this.filters = [...filters, newFilter]
	}

	removeFilter(index) {
		this.filters = this.filters.filter((_, i) => i !== index)
	}

	updateFilter(index, field, value) {
		/* replace existing filters, including the new one */
		const newFilters = [...this.filters]
		newFilters[index][field] = value
		this.filters = newFilters
	}

	createRenderRoot() {
		return this
	}

	render() {
		return html`
			<form @submit=${this.onFormSubmit}>
				${this.filters?.length ? this.renderFilters() : null}
				<fieldset>
					<button @click=${this.addFilter}>Add filter</button>
				</fieldset>
			</form>
		`
	}

	renderFilters() {
		/* some table need default filters, channel_track, a "channel", to get the tracks of
			 (might be multiple channels? ex. "all tracks with #dub from @x & @y") */
		const renderFilterItem = (filter, index) => {
			return html`
				<li>
					<fieldset>
						${this.renderFilter(filter, index)}
						<button @click=${() => this.removeFilter(index)}>Remove filter</button>
					</fieldset>
				</li>
			`
		}

		return html`<ul>
			${this.filters.map(renderFilterItem.bind(this))}
		</ul>`
	}

	renderFilter(filter, index) {
		const allFilterOptions = [...tables[this.table].columns, ...(tables[this.table]?.junctions || [])]
		return html`
			<fieldset>
				<label>
					Column
					<select @input=${(e) => this.updateFilter(index, 'column', e.target.value)}>
						${this.table
							? allFilterOptions.map((column) => this.renderOption(column, {selected: column === filter.column}))
							: null}
					</select>
				</label>
			</fieldset>

			<fieldset>
				<label>
					Operator
					<select @input=${(e) => this.updateFilter(index, 'operator', e.target.value)}>
						${supabaseOperators.map((operator) =>
							this.renderOption(operator, {selected: operator === filter.operator})
						)}
					</select>
				</label>
			</fieldset>

			<fieldset>
				<label>
					Value
					<input
						type="text"
						@input=${(e) => this.updateFilter(index, 'value', e.target.value)}
						.value=${filter.value}
					/>
				</label>
			</fieldset>
		`
	}

	/* "just render and html option" */
	renderOption(value, config) {
		const {selected} = config
		return html`<option value="${value}" ?selected=${selected}>${value}</option>`
	}
}
