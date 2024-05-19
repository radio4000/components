import {parseUrl as parseDiscogsUrl, fetchDiscogs} from '../libs/discogs.js'

export default class R4DiscogsResource extends HTMLElement {
	static get observedAttributes() {
		return ['url']
	}
	get url() {
		return this.getAttribute('url')
	}
	get full() {
		return this.getAttribute('full') === 'true'
	}
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
	render(resource, full = this.full) {
		if (resource) {
			if (full) {
				this.replaceChildren(this.buildFull(resource))
			} else {
				this.replaceChildren(this.buildCard(resource))
			}
		} else {
			this.replaceChildren('')
		}
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
}
