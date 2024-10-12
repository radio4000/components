import {LitElement, html} from 'lit'

export default class R4UserChannelsSelect extends LitElement {
	createRenderRoot() {
		return this
	}

	static properties = {
		channel: {type: Object},
		channels: {type: Array},
	}

	onSelect(event) {
		event.stopPropagation()
		event.preventDefault()
		const {value: id} = event.target
		this.dispatchEvent(
			new CustomEvent('select', {
				bubbles: true,
				detail: this.channels.find((c) => c.id === id),
			}),
		)
	}

	render() {
		return html`
			<label>
				<select @change=${this.onSelect} title="Selected Radio">
					<optgroup label="Selected">
						<option value=${this.channel.id}>${this.channel.slug}</option>
					</optgroup>
					<optgroup label="Channels">${this._renderOptions()}</optgroup>
				</select>
			</label>
		`
	}

	_renderOptions() {
		return this.channels?.map((channel) => {
			return html` <option value=${channel.id}>${channel.slug}</option> `
		})
	}
}
