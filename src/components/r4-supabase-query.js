import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

/* browse the list (of data models) like it is paginated;
	 (query params ->) components-attributes -> supbase-query
	 this does not render the list, just browses it
 */
async function browsePage({page, limit, model, select, orderKey, orderConfig}) {
	const {from, to, limitResults} = getBrowseParams({page, limit})
	return sdk.supabase.from(model).select(select).limit(limitResults).order(orderKey, orderConfig).range(from, to)
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
	 its attributes are bound to the supabase sdk model query values
 */
export default class R4SupabaseQuery extends LitElement {
	upperLimit = 999

	static properties = {
		page: {type: Number, reflect: true},
		limit: {type: Number, reflect: true},

		/* supabase query parameters */
		model: {type: String},
		orderKey: {type: String, attribute: 'order-key'},
		select: {type: String},
		orderConfig: {type: Object},

		/* are we loading data? */
		loading: {type: Boolean},
		/* the list of items, result of the query for this model, page & limit */
		list: {type: Object},
	}
	constructor() {
		super()
		this.page = null
		this.limit = null
		this.model = ''
		this.orderKey = 'created_at'
		this.select = 'id'
		this.orderConfig = {ascending: true}
		this.loading = false
		this.list = null
	}

	/* the number of items in the list  */
	/* get limit() {
		 const attr = parseFloat(this.getAttribute('limit'))
		 if (!attr || attr <= 0) {
		 return 1
		 } else if (attr > this.upperLimit) {
		 return this.upperLimit
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
	}

	async updateList() {
		const res = await browsePage({
			page: this.page,
			limit: this.limit,
			model: this.model,
			select: this.select,
			orderKey: this.orderKey,
			orderConfig: this.orderConfig,
		})
		if (res) {
			this.list = res.data
		} else {
			/* this.list = [] */
		}

		const listEvent = new CustomEvent('output', {
			bubbles: true,
			detail: {
				page: this.page,
				limit: this.limit,
				list: this.list,
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
		const {name, value} = event.target
		if (name === 'ascending') {
			this.orderConfig[name] = value
		} else if (name) {
			this[name] = value
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
			<form>
				<select name="model" @input=${this.onInput} value=${this.model}>
					<option default disabled>${this.model}</option>
					<option value="channels">channels</option>
					<option value="tracks">tracks</option>
				</select>
				<select name="select" @input=${this.onInput} value=${this.select}>
					<option default value="id">id</option>
					<option value="*">*</option>
				</select>
				<input name="select" @input=${this.onInput} disabled type="text" value=${this.select}
							 placeholder="postgresql select"></input>
				<input name="page" @input=${this.onInput} type="number"
							 value=${this.page} min=${0}
							 placeholder="page"></input>
				<input name="limit" @input=${this.onInput} type="number"
							 value=${this.limit} min=${0}
							 placeholder="limit"></input>
				<select name="orderKey" @input=${this.onInput} value=${this.orderKey}>
					<option default disabled>${this.orderKey}</option>
					<option value="title">title</option>
					<option value="created_at">created_at</option>
				</select>
				<input name="ascending" @input=${this.onInput} type="radio"
							 value=${this.orderConfig?.ascending}></input>
			</form>
			<output>
				${JSON.stringify(this.list)}
			</output>
		`
	}
}
