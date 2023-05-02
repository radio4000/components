import { LitElement, html } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';
import {sdk} from '@radio4000/sdk'
import {
	initMap,
	initMapOnClick,
	addNewChannel,
	clickToCoordinates,
} from '../lib/map'

/**
 * a world globe with the posibility to position a radio channel
 */
export default class R4MapPosition extends LitElement {
	mapRef = createRef()

	async initMap({containerEl}) {
		this.viewer = await initMap({containerEl})

		initMapOnClick({
			viewer: this.viewer,
			callback: this.onMapClick.bind(this),
		})
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

		addNewChannel({
			viewer: this.viewer,
			longitude,
			latitude,
		})

		const positionEvent = new CustomEvent('submit', {
			bubbles: true,
			detail: {
				longitude,
				latitude,
			}
		})
		this.dispatchEvent(positionEvent)
	}

	updated() {
		super.updated()
		const $map = this.mapRef.value;
		if ($map && !this.viewer) {
			this.viewer = this.initMap({
				containerEl: $map
			})
		}
	}

	render() {
		return html`
			<aside ${ref(this.mapRef)}></aside>
		`
	}

	createRenderRoot() {
		return this
	}
}
