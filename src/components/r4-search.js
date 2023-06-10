import {LitElement, html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {sdk} from '@radio4000/sdk'

/**
 * This is the base class for R4ChannelSearch and R4TrackSearch
 * It actively searches the database on every keypress.
 * See https://supabase.com/docs/guides/database/full-text-search
 */
export default class R4Search extends LitElement {
	static properties = {
		value: {type: String, reflect: true},
		table: {type: String, reflect: true},
		results: {type: Array},

		// To construct a link that works where this component is used
		href: {type: String, reflect: true},

		// Only needed for r4-track-search
		slug: {type: String, reflect: true},
	}

	connectedCallback() {
		super.connectedCallback()
		// If the element has an initial value, search for it.
		if (this.value) this.onInput({target: {value: this.value}})
	}

	onSubmit(event) {
		event.preventDefault()
	}

	async onInput(event) {
		const value = event.target.value
		// Clear results if input is.
		if (value.length === 0) this.results = null
		// Only search once we have +3 characters.
		if (value.length < 2) return
		// Query and set results
		const res = await this.query(value)
		this.results = res.data ?? []

	}

	render() {
		return html`
			${this.renderForm()}
			${this.slug && this.results?.length
				? html`<r4-button-play
						slug=${this.slug}
						.tracks=${this.results}
						label="Play search selection"
				  ></r4-button-play>`
				: ''}
			${this.results?.length
				? html` <ul>
						${repeat(
							this.results,
							(item) => item.id,
							(item, index) => html` <li>${this.renderResult(item, index)}</li> `
						)}
				  </ul>`
				: ''}
		`
	}

	renderForm() {
		return html`
			<r4-search-form>
				<form @submit="${this.onSubmit}">
					<label for="query">Search</label>
					<input
						id="query"
						name="query"
						type="search"
						value=${this.value}
						@input="${this.onInput}"
						placeholder=${this.label}
					/>
				</form>
			</r4-search-form>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

export class R4ChannelSearch extends R4Search {
	label = 'channels'
	query(value) {
		return sdk.supabase.from('channels').select().textSearch('fts', `'${value}':*`)
	}
	renderResult(item) {
		return html`<r4-channel-card size="mini" origin=${this.href} .channel="${item}"></r4-channel-card>`
		// return html`<r4-channel-card .channel="${item}"></r4-channel-card>`
	}
}

export class R4TrackSearch extends R4Search {
	label = 'tracks'

	query(value) {
		let query = sdk.supabase.from('channel_tracks').select('*')
		if (this.slug) query = query.eq('slug', this.slug)
		return query.textSearch('fts', `'${value}':*`).order('created_at', {ascending: false})
	}

	renderResult(item, index) {
		const href = this.href + `/tracks/${item.id}`
		return html`
			${index}.
			<a href=${href}>${item.title}</a>
			<small>${item.description}</small>
			${!this.slug ? html`(@${item.slug})` : ''}
		`
	}
}
