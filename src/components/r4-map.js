import { LitElement, html } from 'lit'
import sdk from '@radio4000/sdk'

/**
 *
 */
export default class R4Map extends LitElement {
	static properties = {
		channels: { type: Array, state: true },
	}

	async willUpdate() {
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			this.channels = data.filter(c => c.longitude && c.latitude)
			console.log(this.channels)
		}
	}

	render() {
		if (!this.channels) return html`<p>Loading...</p>`

		return html`
			<div>
			<p>List of channels with coordinates. Create a map like on radio4000.com/map</p>
				${this.channels.map(c => html`
					<p>@${c.slug} &rarr; ${c.longitude}/${c.latitude}</p>
				`)}
			</div>
		`
	}

	createRenderRoot() {
		return this
	}
}
