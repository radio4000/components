import { LitElement, html } from 'lit'

export default class R4ButtonPlay extends LitElement {
	static properties = {
		channel: { type: String, reflect: true },
		track: { type: String, reflect: true },
	}

	play() {
		console.log('this.play', this.track, this.channel)
	}

	render() {
		return html`
			<button @click=${this.play}>Play</button>
		`
	}

	/* no shadow dom */
	createRenderRoot() {
		return this
	}
}
