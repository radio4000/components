import { sdk } from '@radio4000/sdk'
import {getBrowseParams} from '../libs/browse.js'

const template = document.createElement('template')
template.innerHTML = `
	<main name="list"></main>
	<aside name="pagination"></aside>
`

/*
	 list-channels, default `page="1"`, `limit="1"`;
	 its attributes are bound to the supabase sdk model query values
 */
export default class R4List extends HTMLElement {
	upperLimit = 999

	static get observedAttributes() {
		return ['loading', 'limit', 'list', 'page', 'origin']
	}
	/* should it dislay a pagination */
	get pagination() {
		return this.getAttribute('pagination') === 'true'
	}
	/* supabase query parameters */
	get model() {
		return this.getAttribute('model')
	}
	get orderKey() {
		const defaultKey = 'created_at'
		return this.getAttribute('order-key') || defaultKey
	}
	get select() {
		const defaultSelect = 'id' // could be '*', to get every attributes
		return this.getAttribute('select') || defaultSelect
	}
	get orderConfig() {
		const defaultConfig = { ascending: true }
		return JSON.parse(this.getAttribute('order-config')) || defaultConfig
	}
	/* the number of items in the list  */
	get limit() {
		const attr = parseFloat(this.getAttribute('limit'))
		if (!attr || attr <= 0) {
			return 1
		} else if (attr > this.upperLimit) {
			return this.upperLimit
		} else {
			return attr
		}
	}
	/* current page number being browsed */
	get page() {
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
	}
	/* the list of items, result of the query for this model, page & limit */
	get list() {
		return JSON.parse(this.getAttribute('list'))
	}
	set list(arr = []) {
		this.setAttribute('list', JSON.stringify(arr))
	}

	/* a URL, that will be passed to the list item template, if requested */
	get origin() {
		return this.getAttribute('origin')
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName, oldVal, newVal) {
		/* the page changes, update the list */
		if (['page', 'limit'].indexOf(attrName) > -1) {
			if (oldVal !== newVal) {
				await this.updateList()
			}
		}
		/* the list of items changes, update the DOM */
		if (['list'].indexOf(attrName) > -1) {
			this.render()
		}
	}

	connectedCallback() {
		this.append(template.content.cloneNode(true))
		this.$list = this.querySelector('[name="list"')
		this.$pagination = this.querySelector('[name="pagination"')
		this.$pagination.addEventListener('click', this.onPagination.bind(this))

		/* get the template to use for each items;
			 a template element as child of the list element */
		if (!this.itemTemplate) {
			this.itemTemplate = this.querySelector('template')
		}
		this.updateList()
	}

	async updateList() {
		const res = await this.browsePage({
			page: this.page,
			limit: this.limit,
		})
		if (res) {
			this.list = res.data
		} else {
			/* this.list = [] */
		}

		const listEvent = new CustomEvent('r4-list', {
			bubbles: true,
			detail: {
				page: this.page,
				limit: this.limit,
				list: this.list,
			},
		})
		this.dispatchEvent(listEvent)
	}

	/* browse the list (of data models) like it is paginated;
		 components-attributes -> supbase-query */
	async browsePage(props) {
		const { from, to, limit } = getBrowseParams(props)
		return sdk.supabase
			.from(this.model)
			.select(this.select)
			.limit(limit)
			.order(this.orderKey, this.orderConfig)
			.range(from, to)
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

	/*
		 if the item's template has "attribute",
		 let's try to get their value, from the API answer data
	 */
	setItemAttributes($item, itemData) {
		if (this.itemTemplate) {
			const attributeName = this.itemTemplate.getAttribute('attribute')
			const elementName = this.itemTemplate.getAttribute('element')
			const propertyName = this.itemTemplate.getAttribute('property')
			const $dataItem = $item.querySelector(elementName)

			/* if <template element="r4-channel" attribute="channel" />
				 set the itemData as json on <r4-channel channel={itemData}/>
			 */
			if ($dataItem && elementName && attributeName) {
				$dataItem.setAttribute(attributeName, JSON.stringify(itemData))
				/* otherwise, if the template data item, has attributes,
					 set their value from the item data */
			} else if ($dataItem && propertyName) {
				$dataItem[propertyName] = itemData
			} else if ($dataItem?.attributes) {
				Object.entries($dataItem.attributes).forEach(([attrIndex, attr]) => {
					const attrValue = itemData[attr.localName]
					if (attrValue) {
						$dataItem.setAttribute(attr.localName, attrValue)
					}
				})
			}

			/* finnally, set the "origin" attribute, if present */
			if (this.origin) {
				$dataItem.setAttribute('origin', this.origin)
			}
		}
		return $item
	}

	render() {
		if (this.list && this.list.length) {
			this.renderItems()
		} else {
			this.renderNoItems()
		}
		if (this.pagination) {
			this.renderPagination()
		}
	}
	renderItems() {
		this.$list.innerHTML = ''
		const $ul = document.createElement('ul')

		/* create the list elements from the template, if any */
		this.list.forEach((item, index) => {
			const itemIndex = this.itemIndex(index)
			const $li = document.createElement('li')
			$li.setAttribute('index', index)
			$li.setAttribute('item-index', itemIndex)

			let $item
			if (this.itemTemplate) {
				$item = this.itemTemplate.content.cloneNode(true)
			} else {
				$item = document.createElement('article')
				$item.innerText = itemIndex
			}
			$item = this.setItemAttributes($item, item)

			$li.append($item)
			$ul.append($li)
		})
		this.$list.append($ul)
	}
	renderNoItems() {
		this.$list.innerHTML = ''
		const $noItemInList = document.createElement('menu')
		const $li = document.createElement('li')
		if (this.itemTemplate) {
			const modelName = this.itemTemplate.getAttribute('attribute')
			const modelElementName = this.itemTemplate.getAttribute('element')
			if (modelName) {
				$li.innerText = `No more ${modelName}s`
			} else if (modelElementName) {
				$li.innerText = `No more ${modelElementName}`
			}
		} else {
			$li.innerText = 'No more item'
		}
		$noItemInList.append($li)
		this.$list.append($noItemInList)
	}
	renderPagination() {
		this.$pagination.innerHTML = ''

		const $label = document.createElement('label')
		$label.innerText = 'Page'

		const $previous = document.createElement('button')
		$previous.setAttribute('name', 'before')
		$previous.innerText = 'before'

		const $next = document.createElement('button')
		$next.setAttribute('name', 'after')
		$next.innerText = 'after'

		const $current = document.createElement('span')
		$current.innerText = this.page

		this.$pagination.append($label)
		this.$pagination.append($previous)
		this.$pagination.append($current)
		this.$pagination.append($next)

		if (this.page === 1) {
			$previous.setAttribute('disabled', true)
		}

		if (this.list && this.list.length < this.limit) {
			$next.setAttribute('disabled', true)
		}
	}
	onPagination(event) {
		const { name } = event.target
		if (name === 'before') {
			this.page = this.page - 1
		}
		if (name === 'after') {
			this.page = this.page + 1
		}
	}
}
