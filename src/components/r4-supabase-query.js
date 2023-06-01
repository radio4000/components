import {LitElement, html} from 'lit'
import dbSchema from '../libs/db-schemas.js'

const {tables, tableNames} = dbSchema

/*
	 list-channels, default `page="1"`, `limit="1"`;
	 its attributes are bound to the supabase sdk table (data model) query values
 */
export default class R4SupabaseQuery extends LitElement {
	static properties = {
		page: {type: Number, reflect: true, searchParam: true},
		limit: {type: Number, reflect: true, searchParam: true},

		/* supabase query parameters */
		table: {type: String, reflect: true, searchParam: true},
		select: {type: String, reflect: true, searchParam: true},
		filters: {type: Array, reflect: true, searchParam: true, state: true},
		defaultFilters: {type: Array, attribute: 'default-filters', reflect: true, searchParam: true, state: true},
		orderBy: {type: String, attribute: 'order-by', reflect: true, searchParam: true},
		orderConfig: {type: Object, attribute: 'order-config', reflect: true, state: true, searchParam: true},
	}

	constructor() {
		super()
		/* all need to be instanciated with correct "value types" */
		this.table = null
		this.select = null
		this.filters = []
		this.defaultFilters = []
		this.orderBy = null
		this.orderConfig = {ascending: false}
		this.page = 1
		this.limit = 10
	}

	connectedCallback() {
		super.connectedCallback()
		this.setInitialValues()
		// this.onQuery()
	}

	updated(attr) {
		/* always update the list when any attribute change
			 for some attribute, first clear the existing search query */
		if (attr.get('table')) this.cleanQuery()
		this.onQuery()
	}

	/* set the correct component initial values, for each table's capacities */
	setInitialValues() {
		if (!this.page) this.page = 1
		if (!this.limit) this.limit = 10
		if (!this.table) {
			this.table = tables[0]
		}
		const tableData = tables[this.table]
		this.select = this.select || tableData.selects[0]
		if (tableData.junctions) {
			const [foreignTable, foreignColumn] = tableData.junctions[0].split('.')
			this.orderBy = this.orderBy || foreignColumn
			this.orderConfig = {...this.orderConfig, foreignTable: foreignTable}
		} else {
			this.orderBy = this.orderBy || tableData.columns[0]
			this.orderConfig = {...this.orderConfig, foreignTable: null}
		}
	}

	async onQuery() {
		const queryEvent = new CustomEvent('query', {
			bubbles: true,
			detail: {
				table: this.table,
				select: this.select,
				filters: [...this.defaultFilters, ...this.filters],
				orderBy: this.orderBy,
				orderConfig: this.orderConfig,
				page: this.page,
				limit: this.limit,
			},
		})
		this.dispatchEvent(queryEvent)
	}

	onInput(event) {
		event.stopPropagation()
		event.preventDefault()
		const {name, value, valueAsNumber, type: inputType, checked} = event.target

		/* handle correctly input type="number" */
		if (inputType === 'number') {
			this[name] = valueAsNumber
		} else if (name === 'ascending') {
			/* this is a input[checkbox] and setting, inside a nested Object */
			this.orderConfig = {...this.orderConfig, [name]: checked}
		} else if (name === 'orderBy') {
			const [foreignTable, foreignColumn] = value.split('.')
			if (foreignColumn) {
				this.orderConfig = {...this.orderConfig, foreignTable: foreignTable}
				this.orderBy = foreignColumn
			} else {
				this.orderConfig = {...this.orderConfig, foreignTable: null}
				this.orderBy = value
			}
		} else if (name) {
			this[name] = value
		}
	}
	onFilters({detail}) {
		this.filters = detail
	}
	onFormSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
	}

	/*
		 "cleans" (as in "reset to correct values")
		 the components attributes, when the table change;
		 is triggered before invoquing "onQuery"*/
	cleanQuery() {
		this.page = 1
		/* this.limit = this.limit // stay unchanged? */

		if (!this.table) {
			// handle the case where there is no table selected; to display no result problably, or error
		} else if (this.table) {
			const tableData = tables[this.table]
			/* otherise reset all necessary values */
			this.select = tableData.selects[0]
			if (tableData.junctions) {
				const [foreignTable, foreignColumn] = tableData.junctions[0].split('.')
				this.orderBy = foreignColumn
				this.orderConfig = {...this.orderConfig, foreignTable: foreignTable}
			} else {
				this.orderConfig = {...this.orderConfig, foreignTable: null}
				this.orderBy = tableData.columns[0]
			}
		}
	}

	createRenderRoot() {
		return this
	}
	render() {
		return this.renderQueryBuilder()
	}

	renderQueryBuilder() {
		return html`
			<form @submit=${this.onFormSubmit}>
				${[
					this.renderQueryTable(),
					this.renderQuerySelect(),
				]}
			</form>
			<r4-supabase-filters table=${this.table} filters=${this.filters} @filters=${this.onFilters}></r4-supabase-filters>
			<form @submit=${this.onFormSubmit}>
				${[
					this.renderQueryOrderKey(),
					this.renderOrderConfig(),
					this.renderQueryPage(),
					this.renderQueryLimit(),
				]}
			</form>
		`
	}
	renderQueryTable() {
		return html`
			<fieldset name="table">
				<label for="table">table</label>
				<select id="table" name="table" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.table}</option>
					</optgroup>
					${tableNames.map((table) => this.renderOption(table, {selected: this.table === table}))}
				</select>
			</fieldset>
		`
	}
	renderQuerySelect() {
		return html`
			<fieldset name="select">
				<label for="select">select</label>
				<select id="select" name="select" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.select}</option>
					</optgroup>
					${this.renderQuerySelectByTable()}
				</select>
				<input id="select-display" name="select" @input=${this.onInput} type="text"
					.value=${this.select} placeholder="postgresql select" />
			</fieldset>
		`
	}
	renderQueryPage() {
		return html`
			<fieldset name="page">
				<label for="page">page</label>
				<input id="page" name="page" @input=${this.onInput} type="number"
					.value=${this.page} step="1" min="1" pattern="[0-9]" placeholder="page" />
			</fieldset>
		`
	}
	renderQueryLimit() {
		return html`
			<fieldset name="limit">
				<label for="limit">limit</label>
				<input id="limit" name="limit" @input=${this.onInput} type="number"
					.value=${this.limit} step="1" min="1" max="4000" pattern="[0-9]" placeholder="limit" />
			</fieldset>
		`
	}
	renderQueryOrderKey() {
		return html`
			<fieldset name="orderBy">
				<label for="orderBy">order-by</label>
				<select id="orderBy" name="orderBy" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.orderBy}</option>
					</optgroup>
					${this.renderQueryOrder()}
				</select>
			</fieldset>
		`
	}
	renderOrderConfig() {
		const {ascending} = this.orderConfig
		return html`
			<fieldset name="ascending">
				<label for="ascending"> ${ascending ? '↑' : '↓'} </label>
				<input id="ascending" name="ascending" @input=${this.onInput} type="checkbox" ?checked=${ascending} />
			</fieldset>
		`
	}

	/* different order keys for each tables */
	renderQueryOrder() {
		if (!this.table) return null
		const tableData = tables[this.table]
		const orders = tableData.junctions ? tableData.junctions : tableData.columns
		return orders.map((column) => this.renderOption(column, {selected: column === this.orderBy}))
	}

	renderQuerySelectByTable() {
		if (!this.table) return null
		return tables[this.table].selects.map((sqlSelect) =>
			this.renderOption(sqlSelect, {selected: sqlSelect === this.select})
		)
	}

	/* "just render and html option" */
	renderOption(value, config) {
		const {selected} = config
		return html`<option value="${value}" ?selected=${selected}>${value}</option>`
	}
}
