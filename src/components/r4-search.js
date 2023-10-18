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
		search: {type: String, reflect: true},
		results: {type: Array},
		// To construct a link that works where this component is used
		href: {type: String, reflect: true},
		// Only needed for r4-track-search
		slug: {type: String, reflect: true},
		autofocus: {type: Boolean},
	}
	get searchValid() {
		return this.search.length > 2
	}
	constructor() {
		super()
		this.search = ''
		this.autofocus = false
	}
	connectedCallback() {
		super.connectedCallback()
		// If the element has an initial value, search for it.
		if (this.search) this.onInput({target: {value: this.value}})
	}
	firstUpdated() {
		if (this.autofocus) {
			this.focusInput()
		}
	}
	onSubmit(event) {
		event.preventDefault()
	}
	focusInput() {
		this.querySelector('input[type="search"]').focus()
	}
	async onInput(event) {
		this.search = event.target.value
		if (!this.searchValid) {
			return
		}
		// Query and set results
		const res = await this.query(this.search)
		this.results = res.data ?? []
		this.dispatchEvent(new CustomEvent('query', {bubbles: true, detail: res.data}))
	}
	render() {
		return html`
			${this.renderForm()}
			${this.slug && this.results?.length
				? html`<r4-button-play
						slug=${this.slug}
						.tracks=${this.results}
						label=" Play search selection"
				  ></r4-button-play>`
				: null}
			${this.results?.length ? this.renderResults() : this.renderNoResults()}
		`
	}
	renderResults() {
		return html`
			<r4-list>
				${repeat(
					this.results,
					(item) => item.id,
					(item, index) => this.renderResult(item, index)
				)}
			</r4-list>
		`
	}
	renderNoResults() {
		const buildDom = () => {
			if (this.searchValid) {
				return html`No <i>${this.label}</i> result for <i>${this.search}.</i>`
			} else {
				return html`Search <i>${this.label}</i> (minimum 3 characters).`
			}
		}
		return html`<r4-search-404>${buildDom()}</r4-search-404>`
	}
	renderForm() {
		return html`
			<r4-search-form>
				<form @submit="${this.onSubmit}">
					<fieldset>
						<label for="query">Search</label>
						<input
							id="query"
							name="query"
							type="search"
							value=${this.value}
							@input="${this.onInput}"
							placeholder=${this.label}
							?autofocus=${this.autofocus}
						/>
					</fieldset>
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

	get channelOrigin() {
		return `${this.href}/{{slug}}`
	}

	renderResult(item) {
		return html`
			<r4-list-item>
				<r4-channel-card origin=${this.channelOrigin} .channel="${item}"></r4-channel-card>
			</r4-list-item>
		`
	}
}

export class R4TrackSearch extends R4Search {
	label = 'tracks'

	query(value) {
		let query = sdk.supabase.from('channel_tracks').select('*')
		if (this.slug) query = query.eq('slug', this.slug)
		return query.textSearch('fts', `'${value}':*`).order('created_at', {ascending: false})
	}

	renderResult(t, index) {
		const origin = this.href + `/${t.slug}/tracks/`
		return html`<r4-track .track=${t} href=${this.href} origin=${origin}></r4-track>`
	}
}
