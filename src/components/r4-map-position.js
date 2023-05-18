import {LitElement, html} from 'lit'

/**
 * A world globe with the posibility to position a radio channel
 */
export default class R4MapPosition extends LitElement {
	static properties = {
		/* public */
		longitude: {type: Number},
		latitude: {type: Number},

		/* state */
		newLongitude: {type: Number},
		newLatitude: {type: Number},
	}

	precision = 3

	/* the coordinates of the original channel position */
	get coordinates() {
		if (!this.longitude || !this.latitude) return null
		return {
			longitude: this.parseCoordinate(this.longitude),
			latitude: this.parseCoordinate(this.latitude),
		}
	}

	/* the new coordinates for this channel's position */
	get newCoordinates() {
		if (!this.newLongitude || !this.newLatitude) return null
		/*
			 precision difference from map click and db storage
			 db: -0.0238691
			 click: -0.023869118833876747
		 */
		return {
			longitude: this.parseCoordinate(this.newLongitude),
			latitude: this.parseCoordinate(this.newLatitude),
		}
	}

	parseCoordinate(coordinate) {
		return +coordinate.toFixed(this.precision)
	}

	get sameCoordinates() {
		if (!this.coordinates || !this.newCoordinates) return false
		return (
			this.coordinates.longitude === this.newCoordinates.longitude &&
			this.coordinates.latitude === this.newCoordinates.latitude
		)
	}

	onMapClick(event) {
		const {longitude, latitude} = event.detail
		console.log('selected position', event.detail)
		this.newLatitude = latitude
		this.newLongitude = longitude
	}

	onSubmit(event) {
		event.preventDefault()
		event.stopPropagation()
		const positionEvent = new CustomEvent('submit', {
			bubbles: false,
			detail: {
				longitude: this.newCoordinates?.longitude,
				latitude: this.newCoordinates?.latitude,
			},
		})
		this.dispatchEvent(positionEvent)
		console.log('submit position', positionEvent)
		// if (!this.newCoordinates) removeChannelOrigin({viewer: this.viewer})
	}

	cancelChanges() {
		console.log('cancel changes')
		this.newLatitude = null
		this.newLongitude = null
		// removeNewChannel({viewer: this.viewer})
	}

	deletePosition() {
		console.log('delete position')
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
		<p>coords: ${this.coordinates?.longitude}, ${this.coordinates?.latitude}</p>
		<p>new coords: ${this.newCoordinates?.longitude}, ${this.newCoordinates?.latitude}</p>
			<fieldset type="buttons">
				${this.coordinates
					? html`<button type="button" name="delete" @click=${this.deletePosition}>Remove position</button>`
					: null}
				${this.newCoordinates
					? html`
							<button type="button" name="cancel" @click=${this.cancelChanges}>Cancel</button>
							<button type="submit" name="submit">Save</button>
					  `
					: null}
			</fieldset>
		`
	}

	createRenderRoot() {
		return this
	}
}
