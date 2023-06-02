import {html, LitElement} from 'lit'

export default class R4Pagination extends LitElement {
	static properties = {
		// searchParams: {type: Object, state: true},
		page: {type: Number, reflect: true },
		lastQuery: {type: Object, state: true},
	}

	prev() {
		this.goTo(Math.max(1, this.page - 1))
	}

	next() {
		this.goTo(this.page + 1)
	}

	goTo(page) {
		this.page = page
		const newQuery = {...this.lastQuery, page}
		console.log('pager last q', this.lastQuery, newQuery)
		this.dispatchEvent(new CustomEvent('query', {detail: newQuery}))
	}

	render() {
		return html`
			<button @click=${this.prev}>Prev</button>
			<button @click=${this.next}>Next</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
