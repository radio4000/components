import { LitElement, html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { sdk } from '@radio4000/sdk'

/**
 * This is the base class for R4ChannelSearch and R4TrackSearch
 * It actively searches the database on every keypress.
 * See https://supabase.com/docs/guides/database/full-text-search
 */
export default class R4Search extends LitElement {
	static properties = {
		value: { type: String, reflect: true },
		table: { type: String, reflect: true },
		results: { type: Array },

		// To construct a link that works where this component is used
		href: { type: String, reflect: true },

		// Only needed for r4-track-search
		slug: { type: String, reflect: true },
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
			<ul>
				${repeat(
					this.results || [],
					(item) => item.id,
					(item, index) => html` <li>${this.renderResult(item, index)}</li> `
				)}
			</ul>
		`
	}

	renderForm() {
		return html`
			<r4-search-form>
				<form @submit="${this.onSubmit}">
					<label for="query">${this.label}</label>
					<input id="query" name="query" type="search" value=${this.value} @input="${this.onInput}" />
					<svg class="aa-input-icon" viewBox="654 -372 1664 1664">
						<path
							d="M1806,332c0-123.3-43.8-228.8-131.5-316.5C1586.8-72.2,1481.3-116,1358-116s-228.8,43.8-316.5,131.5  C953.8,103.2,910,208.7,910,332s43.8,228.8,131.5,316.5C1129.2,736.2,1234.7,780,1358,780s228.8-43.8,316.5-131.5  C1762.2,560.8,1806,455.3,1806,332z M2318,1164c0,34.7-12.7,64.7-38,90s-55.3,38-90,38c-36,0-66-12.7-90-38l-343-342  c-119.3,82.7-252.3,124-399,124c-95.3,0-186.5-18.5-273.5-55.5s-162-87-225-150s-113-138-150-225S654,427.3,654,332  s18.5-186.5,55.5-273.5s87-162,150-225s138-113,225-150S1262.7-372,1358-372s186.5,18.5,273.5,55.5s162,87,225,150s113,138,150,225  S2062,236.7,2062,332c0,146.7-41.3,279.7-124,399l343,343C2305.7,1098.7,2318,1128.7,2318,1164z"
						/>
					</svg>
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
	label = 'Search channels'
	query(value) {
		return sdk.supabase.from('channels').select().textSearch('fts', `'${value}':*`)
	}
	renderResult(item) {
		return html`<r4-channel-card size="mini" origin=${this.href} .channel="${item}"></r4-channel-card>`
		// return html`<r4-channel-card .channel="${item}"></r4-channel-card>`
	}
}

export class R4TrackSearch extends R4Search {
	label = 'Search tracks'

	query(value) {
		let query = sdk.supabase.from('channel_track').select(
			`
				channel_id!inner(
					slug
				),
				track_id!inner(
					id, title, description, tags, mentions, fts
				)
			`
		)
		if (this.slug) query = query.eq('channel_id.slug', this.slug)
		return query.textSearch('track_id.fts', `'${value}':*`)
	}

	renderResult(item, index) {
		const href = this.href + `/${item.channel_id.slug}/tracks/${item.track_id.id}`
		return html` ${index}.
			<a href=${href}>${item.track_id.title}</a>
			<small>${item.track_id.description}</small>
			${this.slug ? html`(from ${item.channel_id.slug})` : ''}
		`
	}
}

