import {parseUrl as parseDiscogsUrl, fetchDiscogs, extractSuggestions} from '../libs/discogs.js'

export default class R4DiscogsResource extends HTMLElement {
	static get observedAttributes() {
		return ['url']
	}
	/* props */
	get url() {
		return this.getAttribute('url')
	}
	get full() {
		return this.getAttribute('full') === 'true'
	}
	get suggestions() {
		return this.getAttribute('suggestions') === 'true'
	}

	/* helpers */
	get allValues() {
		return Array.from(this.querySelectorAll('input[type=checkbox]:checked')).map((input) => input.value)
	}

	/* event handlers */
	onSuggestion(event) {
		event.preventDefault()
		event.stopPropagation()
		this.dispatchEvent(
			new CustomEvent('suggestion', {
				bubbles: true,
				detail: this.allValues,
			}),
		)
	}

	/* lifecycle */
	async attributeChangedCallback(name, oldVal, newVal) {
		if (name === 'url') {
			if (newVal) {
				const resource = await this.fetchResource(newVal)
				this.render(resource)
			} else {
				this.render()
			}
		}
	}
	async connectedCallback() {
		if (this.url) {
			const resource = await this.fetchResource(this.url)
			this.render(resource)
		}
	}
	async fetchResource(url) {
		const discogsInfo = parseDiscogsUrl(url)
		if (discogsInfo.id && discogsInfo.type) {
			return fetchDiscogs(discogsInfo)
		}
	}
	render(resource, full = this.full, suggestions = this.suggestions) {
		const doms = []
		if (resource) {
			if (full) {
				doms.push(this.buildFull(resource))
			} else {
				doms.push(this.buildCard(resource))
			}
		}
		if (suggestions) {
			doms.push(this.buildSuggestions(resource))
		}
		this.replaceChildren(...doms)
	}
	buildCard({title, artists_sort}) {
		return `${title} (artists_sort)`
	}
	buildFull(resource) {
		const {uri} = resource
		const anchor = document.createElement('a')
		anchor.textContent = this.buildCard(resource)
		anchor.setAttribute('href', uri)
		anchor.setAttribute('target', '_blank')
		return anchor
	}
	buildSuggestions(resource) {
		console.log('resource', resource)
		const suggestions = extractSuggestions(resource)
			.filter((res) => !!res)
			.map(this.buildSuggestion.bind(this))
		const fieldset = document.createElement('fieldset')
		const legend = document.createElement('legend')
		legend.textContent = 'Suggested tags'
		fieldset.append(legend, ...suggestions)
		return fieldset
	}
	buildSuggestion(suggestion) {
		const input = document.createElement('input')
		input.setAttribute('type', 'checkbox')
		input.setAttribute('value', suggestion)
		input.setAttribute('name', 'tags')
		input.addEventListener('input', this.onSuggestion.bind(this))
		const label = document.createElement('label')
		label.replaceChildren(input, suggestion)
		return label
	}
}
