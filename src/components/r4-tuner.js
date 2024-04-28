import { LitElement, html } from 'lit'
import { sdk } from '../libs/sdk'

export default class R4Tuner extends LitElement {
	static properties = {
		value: { type: Number, reflect: true },
		min: { type: Number, reflect: true },
		max: { type: Number, reflect: true },
		showSource: { type: Boolean },

		channels: { type: Array, state: true },
		selectedChannel: { type: Object, state: true },
	}

	constructor() {
		super()

		// Default values.
		this.value = 0
		this.min = 88
		this.max = 108

		this.setChannels()
	}

	// Fetches all channels, adds a "frequency" property and sorts by it.
	async setChannels() {
		const { data: channels } = await sdk.channels.readChannels()

		for (const c of channels) {
			c.frequency = await generateFrequency(c.name, c.slug, this.min, this.max)
		}

		channels.sort((a, b) => {
			if (a.frequency < b.frequency) return -1
		})

		this.channels = channels
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

			${this.value > 0
				? html` <p>You are tuned to ${this.selectedChannel.frequency} MHz: @${this.selectedChannel?.slug}</p>`
				: null}

			<details ?hidden=${!this.showSource}>
				<summary>View all frequencies</summary>
				<table>
					<tr>
						<td>Frequency</td>
						<td>Slug</td>
					</tr>
					${this.channels &&
					this.channels.map(
						(channel) =>
							html`<tr>
								<td>${channel.frequency}</td>
								<td>@${channel.slug}</td>
							</tr>`
					)}
				</table>
			</details>
		`
	}
}

/**
 * Generate a unique, deterministic frequency based on the channel name and slug.
 * All frequency values are rounded to one decimal place.
 * Values are generated inside a given range.
 * @param {string} channelName
 * @param {string} channelSlug
 * @param {number} minFreq - the minimum frequency
 * @param {number} maxFreq - the maximum frequency
 * @returns string
 */
async function generateFrequency(channelName, channelSlug, minFreq, maxFreq) {
	// Combine the channel name and slug
	const inputString = channelName + channelSlug

	// Generate a hash of the inputString
	const encoder = new TextEncoder()
	const data = encoder.encode(inputString)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = new Uint8Array(hashBuffer)

	// Convert the hash array to a big integer
	const hashBigInt = hashArray.reduce((acc, byte) => acc * BigInt(256) + BigInt(byte), BigInt(0))

	// Scale the hash integer to the given frequency range
	const rangeSize = (maxFreq - minFreq) * 10 // Multiply by 10 to account for the decimal place
	const uniqueFreq = minFreq + Number(hashBigInt % BigInt(rangeSize)) / 10

	// Round to one decimal place
	const uniqueFreqRounded = Math.round(uniqueFreq * 10) / 10

	return uniqueFreqRounded
}
