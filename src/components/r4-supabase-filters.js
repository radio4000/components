import {LitElement, html} from 'lit'
import {supabaseOperators} from '../libs/browse.js'
import dbSchema from '../libs/db-schemas.js'
const {tables} = dbSchema

/**
 * @typedef {object} QueryFilter
 * @prop {string} column
 * @prop {string} operator
 * @prop {string} value
 */

/*
	 An interface to create and manage filters for the Supabase SDK (`supabase.from()...`)
	 Fires @input event whenever any filter is created or changed.
 */
export default class R4SupabaseFilters extends LitElement {
	static properties = {
		// Name of the SQL table to filter
		table: {type: String, reflect: true},
		filters: {type: Array, reflect: true, state: true},
	}

	// constructor() {
	// 	super()
	// 	if (!this.filters) this.filters = []
	// }

	updated(attr) {
		/* always update the list when any attribute change
			 for some attribute, first clear the existing search query */
		// if (attr.get('filters')) {
		// 	console.log('filters changeD?')
		// 	// this.onFilters()
		// }
	}

	// When any filter is set or changed
	onFilters(updatedFilters) {
		console.log('onFilters', updatedFilters)
		this.dispatchEvent(
			new CustomEvent('input', {
				bubbles: true,
				detail: updatedFilters?.filter((filter) => !!filter),
			})
		)
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
		console.log('add filter', newFilter)
		if (!this.filters) this.filters = []
		this.onFilters([...this.filters, newFilter])
	}

	updateFilter(index, field, value) {
		console.log('updateFilter', field, value)
		/* replace existing filters, including the new one */
		const newFilters = [...this.filters]
		newFilters[index][field] = value
		this.onFilters(newFilters)
	}

	removeFilter(index) {
		console.log('removeFilter', index)
		this.onFilters(this.filters.filter((_, i) => i !== index))
	}

	createRenderRoot() {
		return this
	}

	render() {
		return html`
			<form @submit=${this.onFormSubmit}>
				${this.filters?.length ? this.renderFilters() : null}
				<fieldset>
					<label>
						<button type="button" @click=${this.addFilter}>Add filter</button>
					</label>
				</fieldset>
			</form>
		`
	}

	renderFilters() {
		/* some table need default filters, channel_track, a "channel", to get the tracks of
			 (might be multiple channels? ex. "all tracks with #dub from @x & @y") */
		const renderFilterItem = (filter, index) => {
			return html` <fieldset>${this.renderFilter(filter, index)}</fieldset> `
		}
		return this.filters.map(renderFilterItem.bind(this))
	}

	renderFilter(filter, index) {
		const allFilterOptions = [...tables[this.table].columns, ...(tables[this.table]?.junctions || [])]
		return html`
			<fieldset>
				<legend>${index + 1}</legend>
				<button @click=${() => this.removeFilter(index)} destructive>x</button>
			</fieldset>
			<fieldset name="column">
				<legend>Column</legend>
				<select @input=${(e) => this.updateFilter(index, 'column', e.target.value)}>
					${this.table
						? allFilterOptions.map((column) => this.renderOption(column, {selected: column === filter.column}))
						: null}
				</select>
			</fieldset>
			<fieldset name="operator">
				<legend>Operator</legend>
				<select @input=${(e) => this.updateFilter(index, 'operator', e.target.value)}>
					${supabaseOperators.map((operator) => this.renderOption(operator, {selected: operator === filter.operator}))}
				</select>
			</fieldset>
			<fieldset name="value">
				<legend>Value</legend>
				<input type="text" @input=${(e) => this.updateFilter(index, 'value', e.target.value)} .value=${filter.value} />
			</fieldset>
		`
	}

	/* "just render and html option" */
	renderOption(value, config) {
		const {selected} = config
		return html`<option value="${value}" ?selected=${selected}>${value}</option>`
	}
}
