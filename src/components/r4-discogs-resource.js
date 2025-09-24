import {
	parseUrl as parseDiscogsUrl,
	fetchDiscogs,
	extractSuggestions,
	resourceToChannel,
	resourceTrackToR4Track,
} from '../libs/discogs.js'

/**
 * Fetches and displays Discogs music data with track suggestions
 */
export default class R4DiscogsResource extends HTMLElement {
	static get observedAttributes() {
		return ['url', 'href']
	}
	/* props */
	get url() {
		return this.getAttribute('url')
	}
	get href() {
		return this.getAttribute('href')
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
			try {
				return fetchDiscogs(discogsInfo)
			} catch (e) {
				console.error('Erorr fetching discogs', e)
			}
		}
	}
	render(resource, full = this.full, suggestions = this.suggestions) {
		const doms = []
		if (resource) {
			if (full) {
				doms.push(...this.buildFull(resource))
			} else {
				doms.push(this.buildCard(resource))
			}
		}
		if (suggestions) {
			doms.push(this.buildSuggestions(resource))
		}
		this.replaceChildren(...doms)
	}
	buildSuggestions(resource) {
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
	buildCard(resource) {
		return this.buildTitle(resource)
	}
	buildTitle(resource) {
		const {title, artists_sort, artists} = resource
		console.log('resource', resource)
		return `${artists_sort || artists.map((a) => a.name).join(',')} — ${title}`
	}
	buildFull(resource) {
		const anchor = document.createElement('a')
		anchor.textContent = this.buildCard(resource)
		anchor.setAttribute('href', resource.uri)
		anchor.setAttribute('target', '_blank')
		const trackList = this.buildTracklist(resource)
		return [anchor, trackList]
	}
	buildTracklist(resource) {
		const {tracklist, videos, title} = resource
		const $list = document.createElement('r4-list')
		const $tracklist = tracklist?.map((track) => {
			const $listItem = document.createElement('r4-list-item')
			const $track = document.createElement('r4-track')
			$track.setAttribute('href', this.href)
			$track.track = resourceTrackToR4Track(track, resource)
			$track.channel = resourceToChannel(resource)
			$listItem.append($track)
			return $listItem
		})
		$list.append(...$tracklist)
		return $list
	}
}
