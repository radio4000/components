import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

/**
 * Renders a button, to play a channel by slug / track (id)
 * 1. pass in a channel `slug` attribute
 * 2. also pass in a `track` id, of this channel's track to play
 * 3. pass in a "label" string to overwrite the button text contents
 */

export default class R4ButtonPlay extends LitElement {
	static properties = {
		/* a channel's slug */
		slug: {type: String, reflect: true},

		/* a track object */
		track: {type: Object},

		/* or tracks list */
		tracks: {type: Array},

		label: {type: String},

		/* the channel data object */
		channel: {type: Object, state: true},
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
			},
		})
		this.dispatchEvent(playEvent)
	}

	render() {
		const {channel} = this
		return html`
			<button @click="${this.play}">${!channel ? 'Loading...' : '▶'}${this.label ? ` ${this.label}` : ''}</button>
		`
	}

	createRenderRoot() {
		return this
	}
}
