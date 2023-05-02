import { LitElement, html } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';
import {sdk} from '@radio4000/sdk'
import {
	initMap,
	initMapOnClick,
	addNewChannel,
	removeNewChannel,
	addChannelOrigin,
	clickToCoordinates,
} from '../lib/map'

/**
 * a world globe with the posibility to position a radio channel
 */
export default class R4MapPosition extends LitElement {
	static properties = {
		/* public */
		longitude: { type: Number },
		latitude: { type: Number },

		/* state */
		viewer: { type: Object },
		isVisible: { type: Boolean },
		newLongitude: { type: Number },
		newLatitude: { type: Number },
	}

	mapRef = createRef()

	precision = 3

	/* the coordinates of the original channel position */
	get coordinates() {
		if (this.longitude && this.latitude) {
			return {
				longitude: this.parseCoordinate(this.longitude),
				latitude: this.parseCoordinate(this.latitude),
			}
		}
	}

	/* the new coordinates for this channel's position */
	get newCoordinates() {
		/*
			 precision difference from map click and db storage
			 db: -0.0238691
			 click: -0.023869118833876747
		 */
		if (this.newLongitude && this.newLatitude) {
			return {
				longitude: this.parseCoordinate(this.newLongitude),
				latitude: this.parseCoordinate(this.newLatitude),
			}
		}
	}
	parseCoordinate(coordinate) {
		return +coordinate.toFixed(this.precision)
	}

	get sameCoordinates() {
		if (!this.coordinates || !this.newCoordinates ) return false
		return (
			this.coordinates.longitude === this.newCoordinates.longitude &&
			this.coordinates.latitude === this.newCoordinates.latitude
		)
	}

	async initMap({containerEl}) {
		const viewer = await initMap({containerEl})

		initMapOnClick({
			viewer: viewer,
			callback: this.onMapClick.bind(this),
		})

		return viewer
	}

	onMapClick(event) {
		const {
			longitude,
			latitude,
		} = clickToCoordinates({
			event,
			viewer: this.viewer
		})

		if (!longitude || !latitude ) return
		this.newLatitude = latitude
		this.newLongitude = longitude

		addNewChannel({
			viewer: this.viewer,
			longitude,
			latitude,
		})

		const positionEvent = new CustomEvent('input', {
			bubbles: true,
			detail: {
				longitude,
				latitude,
			}
		})
		this.dispatchEvent(positionEvent)
	}

	/* re-render the world map inside the container DOM */
	async updated() {
		super.updated()
		const $map = this.mapRef.value;
		if ($map && !this.viewer) {
			this.viewer = await this.initMap({
				containerEl: $map
			})
		}
		if (this.coordinates && this.viewer) {
			addChannelOrigin({
				viewer: this.viewer,
				longitude: this.coordinates.longitude,
				latitude: this.coordinates.latitude,
			})
		}
		if (this.sameCoordinates) {
			removeNewChannel({viewer: this.viewer})
			this.newLatitude = null
			this.newLongitude = null
		}
	}

	setInitialCoordinates() {
		this.isVisible = true
		/* this.newLongitude = 44.14306640625001
			 this.newLatitude = 10.14193168613103

			 if (this.viewer) {
			 addNewChannel({
			 viewer: this.viewer,
			 longitude: this.newLongitude,
			 latitude: this.newLatitude,
			 })
			 } */
	}

	onSubmit(event) {
		event.preventDefault()
		const positionEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: {
				longitude: this.newLongitude,
				latitude: this.newLatitude,
			}
		})
		this.dispatchEvent(positionEvent)
	}

	cancelChanges() {
		this.newLatitude = null
		this.newLongitude = null
		removeNewChannel({viewer: this.viewer})
	}

	deletePosition() {
		const deletePositionEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: null
		})
		this.dispatchEvent(deletePositionEvent)
	}

	render() {
		if (!this.coordinates && !this.isVisible) {
			return html`<button @click=${this.setInitialCoordinates}>
				Add map position
			</button>`
		} else {
			return html`
				<form @submit=${this.onSubmit}>
					<fieldset>
						<aside ${ref(this.mapRef)}></aside>
					</fieldset>
					${this.renderSubmit()}
				</form>
			`
		}
	}
	renderSubmit() {
		return html`
			<fieldset type="submit">
				${ this.coordinates ? html`<button name="delete" @click=${this.deletePosition}>Delete</button>` : null}
		${ this.newCoordinates ? html`<button name="cancel" @click=${this.cancelChanges}>Cancel</button>` : null}
				${this.newCoordinates ? html`<button type="submit" name="submit">Save</button>` : null}
			</fieldset>
			`
		}

	createRenderRoot() {
		return this
	}
}
