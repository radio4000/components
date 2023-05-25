import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

/*
	 all known supabase query filter operators

	 Warning: these are appended, and executed,
	 to supabase's js sdk "select()" method, as functions
 */
const supabaseOperators = [
	'eq',
	'neq',
	'gt',
	'gte',
	'lt',
	'lte',
	'like',
	'ilike',
	'is',
	'in',
	'contains',
	'containedBy',
	'rangeGt',
	'rangeGte',
	'rangeLt',
	'rangeLte',
	'rangeAdjacent',
	'overlaps',
	'textSearch',
	'match',
	'not',
	'or',
	'filter',
]

/* browse the list (of data models) like it is paginated;
	 (query params ->) components-attributes -> supbase-query
	 this does not render the list, just browses it
 */
async function buildBrowsePageQuery({
	page = 1,
	limit = 1,
	model = '',
	select = '',
	orderKey = '',
	orderConfig = {},
	filters = [],
}) {
	const {from, to, limitResults} = getBrowseParams({page, limit})
	let query = sdk.supabase.from(model).select(select).limit(limitResults).order(orderKey, orderConfig).range(from, to)

	/*
		 add filters to the query,
		 but first, only keep those with "known supabase oprators";
		 Security: we don't want `supabse.sdk.select().[operator]()`,
		 to execute "anything"the user might inject in the interface
	 */
	filters
		.filter((filter) => supabaseOperators.includes(filter.operator))
		.forEach((filter) => {
			/* the operator is the supabase sdk function */
			query = query[filter.operator](filter.column, filter.value)
		})
	console.log('built query', JSON.stringify(query), query.toString())
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
	 suapabse table data associated with each model
 */

const supabaseTables = {
	channels: {
		columns: ['created_at', 'updated_at', 'name', 'description', 'coordinates', 'firebase', 'url', 'id'],
		selects: ['*', 'id'],
	},
	tracks: {
		columns: ['id', 'created_at', 'updated_at', 'title', 'url', 'description', 'mentions', 'tags', 'discogs_url'],
		selects: ['*', 'id'],
	},
	channel_track: {
		columns: ['created_at', 'updated_at', 'user_id', 'channel_id', 'track_id'],
		selects: ['channel_id!inner(slug), track_id(id, created_at, updated_at, title, url, description)'],
	},
}
const supabaseModels = Object.keys(supabaseTables)

/*
	 list-channels, default `page="1"`, `limit="1"`;
	 its attributes are bound to the supabase sdk model query values
 */
export default class R4SupabaseQuery extends LitElement {
	static properties = {
		page: {type: Number, reflect: true},
		limit: {type: Number, reflect: true},

		/* supabase query parameters */
		model: {type: String, reflect: true},
		orderKey: {type: String, attribute: 'order-key', reflect: true},
		select: {type: String, reflect: true},
		filters: {type: Array, reflect: true},
		orderConfig: {type: Object, reflect: true, state: true},

		/* the list of items, result of the query for this model, page & limit */
		list: {type: Object},
	}

	constructor() {
		super()
		/* all need to be instanciated with correct "value types" */
		this.model = null
		this.page = 1
		this.limit = 10
		this.orderKey = 'created_at'
		this.select = '*'
		this.orderConfig = {ascending: false}
		this.list = null
		this.filters = []
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
		this.updateList()
	}

	async willUpdate(attrName) {
		if (!attrName.has('list')) this.updateList()

		if (!attrName.has('model')) this.cleanQuery(this.model)
	}

	async updateList() {
		if (!this.model) return
		const query = buildBrowsePageQuery({
			page: this.page,
			limit: this.limit,
			model: this.model,
			select: this.select,
			orderKey: this.orderKey,
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
				model: this.model,
				select: this.select,
				orderKey: this.orderKey,
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
		this.filters = [...this.filters, {operator: 'eq', column: '', value: ''}]
	}

	removeFilter(index) {
		this.filters = this.filters.filter((_, i) => i !== index)
	}

	updateFilter(index, field, value) {
		const newFilters = [...this.filters]
		newFilters[index][field] = value
		this.filters = newFilters
	}

	/* "resets" the components attributes, when the model change */
	cleanQuery() {}

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
					this.renderQueryModel(),
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
	renderQueryModel() {
		return html`
			<fieldset>
				<label for="model">model</label>
				<select id="model" name="model" @input=${this.onInput} .value=${this.model}>
					<optgroup disabled>
						<option default>${this.model}</option>
					</optgroup>
					${supabaseModels.map(this.renderOption)}
				</select>
			</fieldset>
		`
	}
	renderQuerySelect() {
		return html`
			<fieldset>
				<label for="select">sql-select-query</label>
				<select id="select" name="select" @input=${this.onInput} .value=${this.select}>
					<optgroup disabled>
						<option default>${this.select}</option>
					</optgroup>
					${this.renderQuerySelectByModel()}
				</select>
				<input id="select-display" name="select" @input=${this.onInput} disabled type="text"
					.value=${this.select} placeholder="postgresql select"></input>
			</fieldset>
		`
	}
	renderQueryPage() {
		return html`
			<fieldset>
				<label for="page">page</label>
				<input id="page" name="page" @input=${this.onInput} type="number"
					.value=${this.page} step="1" placeholder="page"></input>
			</fieldset>
		`
	}
	renderQueryLimit() {
		return html`
			<fieldset>
				<label for="limit">limit</label>
				<input id="limit" name="limit" @input=${this.onInput} type="number"
					.value=${this.limit} placeholder="limit"></input>
			</fieldset>
		`
	}
	renderQueryOrderKey() {
		return html`
			<fieldset>
				<label for="orderKey">order-key</label>
				<select id="oderKey" name="orderKey" @input=${this.onInput} .value=${this.orderKey}>
					<optgroup disabled>
						<option default>${this.orderKey}</option>
					</optgroup>
					${this.renderQueryOrderKeyByModel()}
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

	/* different order keys for each models */
	renderQueryOrderKeyByModel() {
		return this.model ? supabaseTables[this.model].columns.map(this.renderOption) : null
	}

	renderQuerySelectByModel() {
		return this.model ? supabaseTables[this.model].selects.map(this.renderOption) : null
	}

	/*
		 rendering methods for the query filters, that can be added by the user;
	 */
	renderFilters() {
		/* some models need default filters, channel_track, a "channel", to get the tracks of
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
		return html`
			<fieldset>
				<label>
					Operator
					<select @input=${(e) => this.updateFilter(index, 'operator', e.target.value)} .value=${filter.operator}>
						${supabaseOperators.map((operator) => html`<option .value=${operator}>${operator}</option>`)}
					</select>
				</label>
			</fieldset>

			<fieldset>
				<label>
					Column
					<select @input=${(e) => this.updateFilter(index, 'column', e.target.value)} .value=${filter.column}>
						${this.model ? supabaseTables[this.model].columns.map(this.renderOption) : null}
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
	renderOption(value, index) {
		return html`<option value="${value}">${value}</option>`
	}
}
