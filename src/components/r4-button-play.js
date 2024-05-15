import {LitElement, html} from 'lit'
import {sdk} from '../libs/sdk.js'

/**
 * Renders a button, to play a channel by slug / track (id)
 * 1. pass in a `slug` (channel) attribute (causes it to fetch)
 * 2. pass in a `track` object, of this channel's track to play
 * 3. pass in a `channel` object to avoid fetching channel
 * 4. pass in a `tracks` array to use as playlist
 * 3. pass in a "label" string to overwrite the button text contents
 */
export default class R4ButtonPlay extends LitElement {
	static properties = {
		label: {type: String},

		/* a channel's slug */
		slug: {type: String, reflect: true},
		/* a track object */
		track: {type: Object},
		/* or tracks list */
		tracks: {type: Array},
		/* the channel data object */
		channel: {type: Object, state: true},
		/* a user search query */
		search: {type: String},
		/* the filters used by a user */
		filters: {type: Array},
		playing: {type: Boolean, reflect: true},
	}

	async connectedCallback() {
		super.connectedCallback()
		if (this.slug && !this.channel) {
			const {data} = await sdk.channels.readChannel(this.slug)
			this.channel = data
		}
	}

	play() {
		const playEvent = new CustomEvent('r4-play', {
			bubbles: true,
			detail: {
				channel: this.channel,
				track: this.track,
				tracks: this.tracks,
				search: this.search,
				filters: this.filters,
			},
		})
		this.dispatchEvent(playEvent)
	}

	render() {
		return html`<button @click=${this.play} ?disabled=${this.playing}>▶${this.label}</button>`
	}

	createRenderRoot() {
		return this
	}
}
