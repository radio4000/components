import {readTrack} from '@radio4000/sdk'
import { html, render } from 'lit-html'

export default class R4Channel extends HTMLElement {
	static get observedAttributes() {
		return ['id', 'track']
	}
	get id() {
		return this.getAttribute('id')
	}

	get track() {
		return JSON.parse(this.getAttribute('track'))
	}
	set track(obj) {
		if (obj) {
			this.setAttribute('track', JSON.stringify(obj))
		} else {
			this.removeAttribute('track')
		}
	}

	/* if the attribute changed, re-render */
	async attributeChangedCallback(attrName) {
		if (['id'].indexOf(attrName) > -1) {
			this.track = await this.readTrack(this.id)
			this.render()
		}
		if (['track'].indexOf(attrName) > -1) {
			this.render()
		}
	}

	/* set loading */
	async connectedCallback() {
		/* if there is already a track json data, render that */
		if (this.track) {
			this.render()
		} else if (this.id) {
			this.track = await this.readTrack(this.id)
		} else {
			this.track = { title: 'No data for this track'}
		}
	}

	async readTrack(id) {
		this.setAttribute('loading', true)
		const res = await readTrack(id)
		this.removeAttribute('loading')
		return res.data
	}

	render() {
		this.innerHTML = ''
		if (!this.track) {
			this.renderNoTrack()
		} else {
			this.renderTrack()
		}
	}
	renderTrack() {
		const t = this.track
		const $track = document.createElement('article')
		render(html`
			${t.title || t.id}<br>
			${t.description}
			<small>
				${t.tags}
				${t.mentions}
			</small>
		`, $track)
		this.append($track)
	}
	renderNoTrack() {
		const $noTrack = document.createElement('span')
		$noTrack.innerText = '404 - track not found'
		this.append($noTrack)
	}
}
