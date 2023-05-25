import {sdk} from '@radio4000/sdk'
import {LitElement, html} from 'lit'

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

	/* add filters to the query */
	filters.forEach((filter) => {
		query = query.filter(filter.column, filter.operator, filter.value)
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
	 its attributes are bound to the supabase sdk model query values
 */
export default class R4SupabaseQuery extends LitElement {
	upperLimit = 999

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
		/* maybe cleanup some attributes, if the model changes? */
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

		if (res) {
			this.list = res.data
		} else {
			/* this.list = [] */
		}

		const listEvent = new CustomEvent('output', {
			bubbles: true,
			detail: {
				list: this.list,
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

	createRenderRoot() {
		return this
	}
	render() {
		return this.renderQueryBuilder()
	}

	renderQueryBuilder() {
		return html`
			<form>
				${[
					this.renderQueryModel(),
					this.renderQuerySelect(),
					this.renderQuerySelectDisplay(),
					this.renderQueryPage(),
					this.renderQueryLimit(),
					this.renderQueryOrderKey(),
					this.renderOrderConfig(),
				]}
			</form>
			<output> ${JSON.stringify(this.list)} </output>
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
					<option value="channels">channels</option>
					<option value="tracks">tracks</option>
					<option value="channel_track">channel_track</option>
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
			</fieldset>
		`
	}
	renderQuerySelectDisplay() {
		return html`
			<fieldset>
				<label for="select-display">limit</label>
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
		const options = {
			/* [{"id":"e69ed566-f1ba-475f-932a-253703e01913","name":"Atakat","slug":"atakatttt","description":"my test channel","url":null,"image":"r76nxlqqbici6hz49vkr","created_at":"2023-04-13T09:52:47.315206+00:00","updated_at":"2023-05-18T18:56:44.76163+00:00","coordinates":null,"longitude":8.73284,"latitude":56.8233,"fts":"'atakat':1 'atakatttt':2 'channel':5 'test':4","favorites":null,"followers":null,"firebase_id":null}] */
			channels: html`
				<option default value="updated_at">updated_at</option>
				<option value="created_at">created_at</option>
				<option value="name">name</option>
				<option value="description">description</option>
				<option value="coordinates">coordinates</option>
				<option value="firebase_id">firebase_id</option>
				<option value="url">url</option>
				<option value="id">id</option>
			`,
			tracks: html`
				<option default value="updated_at">updated_at</option>
				<option value="created_at">created_at</option>
				<option value="title">title</option>
				<option default value="discogs_url">discogs_url</option>
				<option default value="description">description</option>
				<option default value="tags">tags</option>
				<option default value="mentions">mentions</option>
				<option value="id">id</option>
			`,
			channel_track: html`
				<option default value="created_at">created_at</option>
				<option value="updated_at">updated_at</option>
				<option value="user_id">user_id</option>
				<option value="channel_id">channel_id</option>
				<option value="track_id">track_id</option>
			`,
		}
		return options[this.model] || null
	}

	renderQuerySelectByModel() {
		const options = {
			default: html`
				<option default value="*">*</option>
				<option value="id">id</option>
			`,
			channel_track: html`
				<option default value="channel_id!inner(slug), track_id(id, created_at, updated_at, title, url, description)">
					channel_id!inner(slug), track_id(id, created_at, updated_at, title, description, url, discogs_url)
				</option>
			`,
		}
		return options[this.model] || options['default']
	}
}
