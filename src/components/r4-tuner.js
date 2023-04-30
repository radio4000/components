import { LitElement, html } from 'lit'
import { sdk } from '@radio4000/sdk'

export default class R4Tuner extends LitElement {
	static properties = {
		value: { type: Number, reflect: true },
		min: { type: Number, reflect: true },
		max: { type: Number, reflect: true },

		channels: { type: Array, state: true },
		selectedChannel: { type: Object, state: true },
	}

	constructor() {
		super()

		// Default values.
		this.value = 0
		this.min = 88
		this.max = 108

		// Loads channels, sorts by slugs and adds a frequency property.
		sdk.channels.readChannels().then((res) => {
			console.log(res)
			const stepSize = (this.max - this.min) / res.data.length
			this.channels = res.data
				.sort((a, b) => {
					if (a.slug < b.slug) return -1
				})
				.map((channel, index) => {
					channel.frequency = (this.min + index + stepSize).toFixed(1)
					return channel
				})
		})
	}

	_handleChange(event) {
		this.value = event.target.value
		let closestChannel = this.channels.reduce((prev, curr) => {
			return Math.abs(curr.frequency - this.value) < Math.abs(prev.frequency - this.value) ? curr : prev
		})
		this.selectedChannel = closestChannel
	}

	render() {
		return html`
			<label>
				<input
					type="range"
					min="${this.min}"
					max="${this.max}"
					value="${this.value}"
					step="0.1"
					@input="${this._handleChange}"
				/>
			</label>
			${this.value > 0 ? html` <p>You are tuned to ${this.value} MHz: ${this.selectedChannel?.name}</p>` : null}
			<details>
				<summary>source</summary>
				<ul>
					${this.channels && this.channels.map((channel) => html`<li>${channel.frequency}: ${channel.slug}</li>`)}
				</ul>
			</details>
		`
	}
}
