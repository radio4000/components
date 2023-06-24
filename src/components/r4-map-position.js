import {LitElement, html} from 'lit'

/**
 * A world map with the posibility to position a radio channel
 */
export default class R4MapPosition extends LitElement {
	static properties = {
		/* public */
		longitude: {type: Number},
		latitude: {type: Number},

		/* state */
		newLongitude: {type: Number, state: true},
		newLatitude: {type: Number, stateu: true},
	}

	onMapClick(event) {
		const {longitude, latitude} = event.detail
		this.newLatitude = latitude
		this.newLongitude = longitude
	}

	onSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		const positionEvent = new CustomEvent('submit', {
			bubbles: false,
			detail: {
				longitude: this.newLongitude,
				latitude: this.newLatitude,
			},
		})
		this.dispatchEvent(positionEvent)
		// if (!this.newLongitude || !this.newLatitude) removeChannelOrigin({viewer: this.viewer})
	}

	cancelChanges() {
		this.newLongitude = null
		this.newLatitude = null
		// removeNewChannel({viewer: this.viewer})
	}

	deletePosition() {
		const deletePositionEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: null,
		})
		this.dispatchEvent(deletePositionEvent)
		this.cancelChanges()
	}

	render() {
		return html`
			<form @submit=${this.onSubmit}>
				<fieldset>
					<r4-map
						longitude=${this.longitude || 0}
						latitude=${this.latitude || 0}
						@r4-map-click=${this.onMapClick}
					></r4-map>
				</fieldset>
				${this.renderSubmit()}
			</form>
		`
	}

	renderSubmit() {
		return html`
			<fieldset type="buttons">
				${this.longitude && this.latitude
					? html`<button type="button" name="delete" destructive @click=${this.deletePosition}>Remove position</button>`
					: null}
				${this.newLongitude && this.newLatitude
					? html`
							<button type="button" name="cancel" @click=${this.cancelChanges} cancel>Cancel</button>
							<button type="submit" name="submit" primary>Save ${this.newLongitude}, ${this.newLatitude}</button>
					  `
					: null}
			</fieldset>
		`
	}

	createRenderRoot() {
		return this
	}
}
