import {sdk} from '@radio4000/sdk'
import { html, render } from 'lit-html'

export default class R4Track extends HTMLElement {
	static get observedAttributes() {
		return ['origin', 'id', 'track']
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

	/* Used to make a link to the track on the channel's homepage.
		 It could point to different URL schemes,
		 so handle all case, we replace the track `{{id}}` token in the string:
		 - on root: https://radio.example.org/:track_id
		 - on subpage: https://music.example.org/test-radio-2/:track_id
		 - in query parameter:
		 https://example.org/?radio=test-radio-4&track=:track_id
	 */
	get origin() {
		const url = this.getAttribute('origin')
		if (typeof url === 'string') {
			if (this.track && this.track.id) {
				return url.replace('{{id}}', this.track.id)
			}
		}
		return url
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
		}
	}

	async readTrack(id) {
		this.setAttribute('loading', true)
		let res = {}
		if (id) {
			try {
				res = await readTrack(id)
				if (res.error) throw res
			} catch (error) {
				console.log('Error reading track', error)
			}
		}
		this.removeAttribute('loading')

		if (res.data) {
			return res.data
		} else {
			return { title: 'No data for this track' }
		}
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

		/* if there is an origin, create a link to the track */
		let $container
		if (this.origin) {
			$container = document.createElement('a')
			$container.setAttribute('href', this.origin)
		} else {
			$container = document.createElement('article')
		}
		render(html`
			<r4-track-title>${t.title || t.id}<br></r4-track-title>
			<r4-track-description>${t.description}</r4-track-description>
			<r4-track-tags>${t.tags}</r4-track-tags>
			<r4-track-mentions>${t.mentions}</r4-track-mentions>
		`, $container)
		this.append($container)
	}
	renderNoTrack() {
		const $noTrack = document.createElement('span')
		$noTrack.innerText = '404 - track not found'
		this.append($noTrack)
	}
}
