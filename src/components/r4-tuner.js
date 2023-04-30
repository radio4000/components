import { LitElement, html } from 'lit'
import { sdk } from '@radio4000/sdk'

export default class R4Tuner extends LitElement {
	static properties = {
		frequency: { type: Number },
		minRange: { type: Number },
		maxRange: { type: Number },

		channels: { type: Array, state: true },
		selectedChannel: { type: Object, state: true },
	}
	constructor() {
		super()

		this.frequency = 50
		this.minRange = 88
		this.maxRange = 108

		sdk.channels.readChannels().then((res) => {
			console.log(res)

			const stepSize = (this.maxRange - this.minRange) / res.data.length

			this.channels = res.data
				// sort alphabetically by channel.slug
				.sort((a, b) => {
					if (a.slug < b.slug) return -1
				})
				// add a "frequency" property to each channel
				.map((channel, index) => {
					channel.frequency = (this.minRange + index + stepSize).toFixed(1)
					return channel
				})
		})
	}
	_handleChange(event) {
		this.frequency = event.target.value
		let closestChannel = this.channels.reduce((prev, curr) => {
			return Math.abs(curr.frequency - this.frequency) < Math.abs(prev.frequency - this.frequency) ? curr : prev
		})
		this.selectedChannel = closestChannel
	}
	render() {
		return html`
			<label
				>Tune away
				<input
					type="range"
					min="${this.minRange}"
					max="${this.maxRange}"
					value=${this.frequency}
					step="0.1"
					@input="${this._handleChange}"
				/>
			</label>
			<p>You are tuned to ${this.frequency} MHz: ${this.selectedChannel?.name}</p>
			<details>
				<summary>source</summary>
				<ul>
					${this.channels && this.channels.map((channel) => html`<li>${channel.frequency}: ${channel.name}</li>`)}
				</ul>
			</details>
		`
	}
}
