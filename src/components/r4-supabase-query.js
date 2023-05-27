import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

/*
	 all known supabase query filter operators

	 Warning: these are appended, and executed,
	 to supabase's js sdk "select()" method, as functions
 */
export const supabaseOperatorsTable = {
	eq: {},
	neq: {},
	gt: {},
	gte: {},
	lt: {},
	lte: {},
	like: {},
	ilike: {},
	is: {},
	in: {},
	contains: {},
	containedBy: {},
	rangeGt: {},
	rangeGte: {},
	rangeLt: {},
	rangeLte: {},
	rangeAdjacent: {},
	overlaps: {},
	textSearch: {
		config: {
			type: 'websearch',
			config: 'english',
		},
	},
	match: {},
	not: {},
	or: {},
	filter: {},
}
export const supabaseOperators = Object.keys(supabaseOperatorsTable)

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

/* browse the list (of db table) like it is paginated;
	 (query params ->) components-attributes -> supbase-query
	 this does not render the list, just browses it
 */
async function buildBrowsePageQuery({
	page = 1,
	limit = 1,
	table = '',
	select = '',
	orderBy = '',
	orderConfig = {},
	filters = [],
}) {
	const {from, to, limitResults} = getBrowseParams({page, limit})
	let query = sdk.supabase.from(table).select(select).limit(limitResults).order(orderBy, orderConfig).range(from, to)

	/*
		 add filters to the query,
		 but first, only keep those with "known supabase oprators";
		 Security: we don't want `supabse.sdk.select().[operator]()`,
		 to execute "anything"the user might inject in the interface;
		 - the "filter.value" always is a string, from the related `input`
		 we convert it here to the right type the sdk filter expects
	 */
	filters
		.filter((filter) => {
			return supabaseOperators.includes(filter.operator)
		})
		.forEach((filter) => {
			/* handle each type of supabase/postresql filter */
			let valueJson
			try {
				valueJson = JSON.parse(filter.value)
			} catch (e) {}

			/* "filter" operator is a supabse.sdk "escape hatch",
				 aplying the filter raw; see docs
				(WARNING) otherwise the (raw string) operator is the supabase sdk function invoqued
			*/
			if (filter.operator === 'filter') {
				query = query.filter(filter.operator, filter.column, filter.value || null)
			} else if (['contains', 'containedBy'].includes(filter.operator)) {
				query = query[filter.operator](filter.column, valueJson || [filter.value.split(',')] || null)
			} else {
				query = query[filter.operator](filter.column, filter.value || null)
			}
		})
	return query
}

/*
	 converts web component attributes, to supabase sdk query parameters:
	 -> page="1" limit="1"
	 -> from[0] to to[0] limit[0]
 */
function getBrowseParams({page, limit}) {
	let from, to, limitResults
	from = (page - 1) * limit
	to = from + limit - 1
	limitResults = limit - 1
	return {from, to, limitResults}
}

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
		this.updateList()
	}

	updated(attr) {
		/* always update the list when any attribute change
			 for some attribute, first clear the existing search query */
		if (attr.get('table')) this.cleanQuery()
		this.updateList()
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

	async updateList() {
		if (!this.table) return
		const query = buildBrowsePageQuery({
			page: this.page,
			limit: this.limit,
			table: this.table,
			select: this.select,
			orderBy: this.orderBy,
			orderConfig: this.orderConfig,
			filters: this.filters,
		})

		const res = await query
		const {data, error} = res

		const listEvent = new CustomEvent('output', {
			bubbles: true,
			detail: {
				data,
				error,
				page: this.page,
				limit: this.limit,
				table: this.table,
				select: this.select,
				orderBy: this.orderBy,
				orderConfig: this.orderConfig,
				filters: this.filters,
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
		 is triggered before invoquing "updateList"*/
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
