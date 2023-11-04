import {LitElement, html} from 'lit'
import dbSchema from '../libs/db-schemas.js'
import urlUtils from '../libs/url-utils.js'

const {tables, tableNames} = dbSchema

/*
	 list-channels, default `page="1"`, `limit="1"`;
	 its attributes are bound to the supabase sdk table (data model) query values
 */
export default class R4SupabaseQuery extends LitElement {
	static properties = {
		count: {type: Number},
		/* supabase query parameters */
		table: {type: String, reflect: true},
		select: {type: String},
		filters: {type: Array, reflect: true},
		orderBy: {type: String, attribute: 'order-by', reflect: true},
		orderConfig: {type: Object, attribute: 'order-config', reflect: true},
		page: {type: Number, reflect: true},
		limit: {type: Number, reflect: true},
		/* custom parameters that map to the supabase ones */
		order: {type: String, reflect: true},
		search: {type: String, reflect: true},
	}

	get totalPages() {
		const count = this.count || 0
		const limit = this.limit || 1
		return Math.round(count / limit) + 1
	}

	get query() {
		return urlUtils.removeEmptyKeys({
			table: this.table,
			select: this.select,
			filters: this.filters,
			orderBy: this.orderBy,
			order: this.order,
			search: this.search,
			// orderConfig: this.orderConfig,
			page: this.page,
			limit: this.limit,
		})
	}

	connectedCallback() {
		super.connectedCallback()
		this.setInitialValues()
		this.onQuery()
	}

	updated(attr) {
		if (attr.get('table')) this.cleanQuery()
		// Avoid double-fetch when count is passed back down.
		if (attr.get('count') === 0) return
		// Update the list when any attribute changes
		// console.log('query component update', attr)
		// this.onQuery()
	}

	/* set the correct component initial values, for each table's capacities */
	setInitialValues() {
		if (!this.table) this.table = tables[0]
		if (!this.order) this.order = 'desc'
		if (!this.orderConfig) this.orderConfig = {ascending: false}
		if (!this.page) this.page = 1
		if (!this.limit) this.limit = 10
		if (!this.filters) this.filters = []

		const tableData = tables[this.table]
		this.select = this.select || tableData?.selects[0] || '*'

		if (tableData?.junctions) {
			const [foreignTable, foreignColumn] = tableData.junctions[0].split('.')
			this.orderBy = this.orderBy || foreignColumn
			this.orderConfig = {...this.orderConfig, foreignTable: foreignTable}
		} else {
			this.orderBy = this.orderBy || tableData?.columns[0]
		}
	}

	onInput(event) {
		event.stopPropagation()
		event.preventDefault()
		const {name, value, valueAsNumber, type: inputType, checked} = event.target
		console.log('<r4-supabase-query>@onInput', name, value, checked)
		/* handle correctly input type="number" */
		if (inputType === 'number') {
			this[name] = valueAsNumber
		} else if (name === 'order') {
			/* this is a input[checkbox] and setting, inside a nested Object */
			this.order = checked ? 'asc' : 'desc'
			this.orderConfig = {...this.orderConfig, [name]: checked}
		} else if (name === 'orderBy') {
			const [foreignTable, foreignColumn] = value.split('.')
			if (foreignColumn) {
				this.orderConfig.foreignTable = foreignTable
				this.orderBy = foreignColumn
			} else {
				this.orderBy = value
			}
		} else if (name) {
			this[name] = value
		}
		this.onQuery()
	}

	onFilters(event) {
		event.preventDefault()
		event.stopPropagation()
		console.log(
			'<r4-supabase-query@onFilters - overwriting .filters from <r4-supabase-filters>',
			event.detail
		)
		if (event.detail) {
			this.filters = event.detail
			this.onQuery()
		}
	}

	onQuery() {
		const query = this.query
		console.log('<r4-supabase-query>.onQuery', this.limit, query)
		this.dispatchEvent(
			new CustomEvent('query', {
				bubbles: true,
				detail: query,
			})
		)
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
		if (!this.table) {
			// handle the case where there is no table selected; to display no result problably, or error
		} else if (this.table) {
			const tableData = tables[this.table]
			/* otherise reset all necessary values */
			this.select = tableData.selects[0]
			if (tableData.junctions) {
				const [foreignTable, foreignColumn] = tableData.junctions[0].split('.')
				this.orderBy = foreignColumn
				// this.orderConfig = {...this.orderConfig, foreignTable: foreignTable}
			} else {
				// this.orderConfig = {...this.orderConfig, foreignTable: null}
				this.orderBy = tableData.columns[0]
			}
		}
	}

	createRenderRoot() {
		return this
	}

	render() {
		console.log(
			'<r4-supabase-query>.render',
			this.table,
			this.select,
			this.filters,
			this.orderBy,
			this.order,
			this.orderConfig,
			'page', this.page,
			'limit', this.limit
		)
		return html`
			<r4-supabase-select>
				<form @submit=${this.onFormSubmit}>${[this.renderQueryTable(), this.renderQuerySelect()]}</form>
			</r4-supabase-select>
			<r4-supabase-modifiers>
				<form @submit=${this.onFormSubmit}>
					${[this.renderQueryOrderKey(), this.renderOrderConfig(), this.renderQueryPage(), this.renderQueryLimit()]}
				</form>
			</r4-supabase-modifiers>
			<r4-supabase-filters table=${this.table} .filters=${this.filters} @input=${this.onFilters}></r4-supabase-filters>
		`
	}

	renderQueryTable() {
		return html`
			<fieldset name="table">
				<legend for="table">table</legend>
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
				<legend for="select">Select</legend>
				<select id="select" name="select" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.select}</option>
					</optgroup>
					${this.renderQuerySelectByTable()}
				</select>
				<input
					type="text"
					id="select-display"
					name="select"
					placeholder="postgresql select"
					.value=${this.select}
					@input=${this.onInput}
				/>
			</fieldset>
		`
	}

	renderQueryPage() {
		return html`
			<fieldset name="page">
				<legend for="page">Page</legend>
				<input
					id="page"
					name="page"
					type="number"
					placeholder="page"
					.value=${this.page}
					step="1"
					min="1"
					max=${this.totalPages}
					@input=${this.onInput}
				/>/${this.totalPages}
			</fieldset>
		`
	}

	renderQueryLimit() {
		return html`
			<fieldset name="limit">
				<legend for="limit">Limit</legend>
				<input
					id="limit"
					name="limit"
					type="number"
					placeholder="limit"
					.value=${this.limit}
					step="1"
					min="1"
					max="4000"
					@input=${this.onInput}
				/>
			</fieldset>
		`
	}

	renderQueryOrderKey() {
		return html`
			<fieldset name="orderBy">
				<legend for="orderBy">Order by</legend>
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
		const ascending = this.order === 'asc'
		return html`
			<fieldset name="order">
				<legend>Order</legend>
				<label for="order">${ascending ? '↑' : '↓'}</label>
				<input id="order" name="order" @input=${this.onInput} type="checkbox" ?checked=${ascending} />
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
