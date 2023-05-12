import { LitElement, html } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { sdk } from '@radio4000/sdk'

/**
 * Renders an input that searches all channels in `name`, `slug` and `description`.
 * It actively searches the database on every keypress, see https://supabase.com/docs/guides/database/full-text-search
 * Results are rendered with <r4-search-results>
 */

export default class R4Search extends LitElement {
	static properties = {
		value: { type: String, reflect: true },
		table: { type: String, reflect: true },
		results: { type: Array },
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

		const res = this.table === 'tracks' ? await this.searchTracks(value) : await this.searchChannels(value)
		console.log('search results', res)
		this.results = res.data ?? []
	}

	searchChannels(value) {
		return sdk.supabase.from('channels').select().textSearch('fts', `'${value}'`)
	}

	searchTracks(value) {
		return sdk.supabase
			.from('channel_track')
			.select(
				`
				channel_id!inner(
					slug
				),
				track_id!inner(
					id, title, description, tags, mentions, fts
				)
			`
			)
			.textSearch('track_id.fts', `'${value}'`)
	}

	render() {
		return html`
			<form @submit="${this.onSubmit}">
				<input type="search" @input="${this.onInput}" />
				<svg class="aa-input-icon" viewBox="654 -372 1664 1664">
					<path
						d="M1806,332c0-123.3-43.8-228.8-131.5-316.5C1586.8-72.2,1481.3-116,1358-116s-228.8,43.8-316.5,131.5  C953.8,103.2,910,208.7,910,332s43.8,228.8,131.5,316.5C1129.2,736.2,1234.7,780,1358,780s228.8-43.8,316.5-131.5  C1762.2,560.8,1806,455.3,1806,332z M2318,1164c0,34.7-12.7,64.7-38,90s-55.3,38-90,38c-36,0-66-12.7-90-38l-343-342  c-119.3,82.7-252.3,124-399,124c-95.3,0-186.5-18.5-273.5-55.5s-162-87-225-150s-113-138-150-225S654,427.3,654,332  s18.5-186.5,55.5-273.5s87-162,150-225s138-113,225-150S1262.7-372,1358-372s186.5,18.5,273.5,55.5s162,87,225,150s113,138,150,225  S2062,236.7,2062,332c0,146.7-41.3,279.7-124,399l343,343C2305.7,1098.7,2318,1128.7,2318,1164z"
					/>
				</svg>
			</form>
			<ul>
				${repeat(
					this.results || [],
					(item) => item.id,
					(item, index) => html`
						<li>
							${index}:
							${this.table === 'tracks'
								? html`${item.track_id.title}, <small>${item.track_id.description}</small> (from
										${item.channel_id.slug})`
								: html`<r4-channel-card .channel="${item}"></r4-channel-card>`}
						</li>
					`
				)}
			</ul>
		`
	}

	// Disable shadow DOM
	createRenderRoot() {
		return this
	}
}

// export class R4SearchResults extends LitElement {
// 	static properties = {
// 		items: { type: Array },
// 	}
// 	render() {
// 		return html`
// 			<ol>
// 				${this.items?.map((item) => html`<li>${item.name || item.title}</li>`)}
// 			</ol>
// 		`
// 	}
// }
// customElements.define('r4-search-results', R4SearchResults)
