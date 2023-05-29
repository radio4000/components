import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

const {supabaseOperators} = sdk.browse

/*
	 suapabse table data associated with each table
 */

export const supabaseTables = {
	channels: {
		columns: ['created_at', 'updated_at', 'slug', 'name', 'description', 'coordinates', 'url', 'firebase', 'id', 'fts'],
		selects: ['*', 'id'],
	},
	tracks: {
		columns: [
			'created_at',
			'updated_at',
			'title',
			'description',
			'url',
			'discogs_url',
			'mentions',
			'tags',
			'id',
			'fts',
		],
		selects: ['*', 'id'],
	},
	channel_track: {
		junctions: [],
		columns: ['created_at', 'updated_at', 'user_id', 'channel_id', 'channel_id.slug', 'track_id'],
		selects: [],
	},
}
/* build the channel_track default select, from all "tracks" columns */
supabaseTables['channel_track'].selects.push(
	`channel_id!inner(slug),track_id!inner(${supabaseTables.tracks.columns.join(',')})`
)

/* build the channel_track "juction columns", from all "tracks" columns */
const channelTrackJuctionColumns = supabaseTables.tracks.columns.map((column) => `track_id.${column}`)
supabaseTables['channel_track'].junctions = channelTrackJuctionColumns

/* store the list of "tables", from the database tables */
export const supabaseTableNames = Object.keys(supabaseTables)

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
		filters: {type: Array, reflect: true, searchParam: true},
		orderBy: {type: String, attribute: 'order-by', reflect: true, searchParam: true},
		orderConfig: {type: Object, attribute: 'order-config', reflect: true, state: true, searchParam: true},

		/* the list of items, result of the query for this table, page & limit */
		list: {type: Object},
	}

	constructor() {
		super()
		/* all need to be instanciated with correct "value types" */
		this.table = null
		this.page = 1
		this.limit = 10
		this.orderBy = null
		this.select = null
		this.orderConfig = {ascending: false}
		this.list = null
		this.filters = null
	}

	/* the number of items in the list  */
	/* get limit() {
		 const upperLimit = 999
		 const attr = parseFloat(this.getAttribute('limit'))
		 if (!attr || attr <= 0) {
		 return 1
		 } else if (attr > upperLimit) {
		 return upperLimit
		 } else {
		 return attr
		 }
		 } */
	/* current page number being browsed */
	/* get page() {
		 const attr = parseFloat(this.getAttribute('page'))
		 if (!attr || attr <= 0) {
		 return 1
		 } else {
		 return attr
		 }
		 }
		 set page(digit) {
		 if (digit) {
		 this.setAttribute('page', parseFloat(digit))
		 } else {
		 this.removeAttribute('page')
		 }
		 } */

	connectedCallback() {
		super.connectedCallback()
		this.setInitialValues()
		/* this.onQuery() */
	}

	updated(attr) {
		/* always update the list when any attribute change
			 for some attribute, first clear the existing search query */
		if (attr.get('table')) this.cleanQuery()
		this.onQuery()
	}

	/* set the correct component initial values, for each table's capacities */
	setInitialValues() {
		if (!this.table) {
			this.table = supabaseTableNames[0]
		}
		this.select = this.select || supabaseTables[this.table].selects[0]
		this.orderBy = this.orderBy || supabaseTables[this.table].columns[0]
		this.filters = this.filters || []
	}

	async onQuery() {
		/* if (!this.table) return */
		const listEvent = new CustomEvent('query', {
			bubbles: true,
			detail: {
				table: this.table,
				select: this.select,
				orderBy: this.orderBy,
				orderConfig: this.orderConfig,
				filters: this.filters,
				page: this.page,
				limit: this.limit,
			},
		})
		this.dispatchEvent(listEvent)
	}

	/* calculate the index of a list item globally,
		 for the current page/limit/ul.index;
		 itemCurrentListIndex, is indexed 0 (`<li>` element) */
	itemIndex(itemCurrentListIndex) {
		if (this.page === 1) {
			return this.page + itemCurrentListIndex
		} else {
			const startAt = (this.page - 1) * this.limit
			return startAt + itemCurrentListIndex + 1 // initial is `0`
		}
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
		} else if (name) {
			this[name] = value
		}
	}
	onFormSubmit(event) {
		event.preventDefault()
	}

	/* Methods for managing filters */
	addFilter() {
		/* crea a new filter with "sane defaults" */
		if (!this.table) return

		const newFilter = {
			operator: this.filters[0]?.operator || supabaseOperators[0],
			column: this.filters[0]?.column || this.orderBy,
			value: '',
		}
		this.filters = [...this.filters, newFilter]
	}

	removeFilter(index) {
		this.filters = this.filters.filter((_, i) => i !== index)
	}

	updateFilter(index, field, value) {
		/* harmonize the "filter value", from a string to expected value, from operator */

		/* replace existing filters, including the new one */
		const newFilters = [...this.filters]
		newFilters[index][field] = value
		this.filters = newFilters
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
			/* otherise reset all necessary values */
			this.select = supabaseTables[this.table].selects[0]
			this.orderBy = supabaseTables[this.table].columns[0]
			this.filters = []
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
					this.renderQueryPage(),
					this.renderQueryLimit(),
					this.renderQueryOrderKey(),
					this.renderOrderConfig(),
				]}
			</form>
			<form @submit=${this.onFormSubmit}>
				${this.filters.length ? this.renderFilters() : null}
				<fieldset>
					<button @click=${this.addFilter}>Add filter</button>
				</fieldset>
			</form>
		`
	}
	renderQueryTable() {
		return html`
			<fieldset>
				<label for="table">table</label>
				<select id="table" name="table" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.table}</option>
					</optgroup>
					${supabaseTableNames.map((table) => this.renderOption(table, {selected: this.table === table}))}
				</select>
			</fieldset>
		`
	}
	renderQuerySelect() {
		return html`
			<fieldset>
				<label for="select">select</label>
				<select id="select" name="select" @input=${this.onInput}>
					<optgroup disabled>
						<option>${this.select}</option>
					</optgroup>
					${this.renderQuerySelectByTable()}
				</select>
				<input id="select-display" name="select" @input=${this.onInput} type="text"
					.value=${this.select} placeholder="postgresql select"></input>
			</fieldset>
		`
	}
	renderQueryPage() {
		return html`
			<fieldset>
				<label for="page">page</label>
				<input id="page" name="page" @input=${this.onInput} type="number"
					.value=${this.page} step="1" min="0" pattern="[0-9]" placeholder="page"></input>
			</fieldset>
		`
	}
	renderQueryLimit() {
		return html`
			<fieldset>
				<label for="limit">limit</label>
				<input id="limit" name="limit" @input=${this.onInput} type="number"
					.value=${this.limit} step="1" min="0" max="4000" pattern="[0-9]" placeholder="limit"></input>
			</fieldset>
		`
	}
	renderQueryOrderKey() {
		return html`
			<fieldset>
				<label for="orderBy">order-by</label>
				<select id="oderKey" name="orderBy" @input=${this.onInput}>
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
			<fieldset>
				<label for="ascending">
					${ascending ? '↑' : '↓'}
				</label>
				<input id="ascending" name="ascending" @input=${this.onInput} type="checkbox"
					.checked=${ascending}></input>
			</fieldset>
		`
	}

	/* different order keys for each tables */
	renderQueryOrder() {
		return this.table
			? supabaseTables[this.table].columns.map((column) =>
					this.renderOption(column, {selected: column === this.orderBy})
			  )
			: null
	}

	renderQuerySelectByTable() {
		return this.table
			? supabaseTables[this.table].selects.map((sqlSelect) =>
					this.renderOption(sqlSelect, {selected: sqlSelect === this.select})
			  )
			: null
	}

	/*
		 rendering methods for the query filters, that can be added by the user;
	 */
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
		const allFilterOptions = [...supabaseTables[this.table].columns, ...(supabaseTables[this.table]?.junctions || [])]
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
