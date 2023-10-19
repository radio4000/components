import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

import 'ol/ol.css'
import {Map, View, Feature, Overlay} from 'ol'
import {OSM} from 'ol/source'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/Tile'
import {Point} from 'ol/geom'
import {Select} from 'ol/interaction'
import Link from 'ol/interaction/Link.js'
import {click} from 'ol/events/condition'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Circle from 'ol/style/Circle'
import {useGeographic} from 'ol/proj'
import {toStringHDMS} from 'ol/coordinate'

// Switch default coordinate system to lon/lat
useGeographic()

/**
 * A world map with all radio channels that have coordinates
 */
export default class R4Map extends LitElement {
	static properties = {
		// List of channels with coordinates.
		channels: {type: Array, state: true},

		// The channel that is currently selected on the map.
		channel: {type: Object, state: true},

		// List of channels markers "ol layers"
		markers: {type: Array, state: true},

		// Optional, initial map position
		longitude: {type: Number},
		latitude: {type: Number},

		clickedCoordinates: {type: Array, state: true},

		// For building the channel origin URL.
		href: {type: String},

		// True when the map has been created.
		isReady: {type: Boolean, attribute: 'is-ready', reflect: true},

		// Syncs the map state to the URL. False by default.
		url: {type: Boolean, attribute: 'url'},
	}

	constructor() {
		super()
		// Default values
		this.longitude = 0
		this.latitude = 0
		this.markers = []
	}

	get channelOrigin() {
		const href = this.href || window.location
		return `${href}/${this.channel.slug}`
	}

	async firstUpdated() {
		this.createMap()
		this.isReady = true

		// Fetch channels and set markers for each.
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			if (!data) return
			this.channels = data.filter((c) => c.longitude && c.latitude)
		}
		this.markers = this.channels?.map((c) => this.createMarker([c.longitude, c.latitude], c))
	}
	willUpdate(changedProperties) {
		if (changedProperties.has('channels')) {
			if (this.map) {
				this.removeMarkers()
				this.markers = this.channels?.map((c) => this.createMarker([c.longitude, c.latitude], c))
			}
		}
	}

	createMap() {
		// Create an overlay to anchor the popup to the map.
		const popup = this.querySelector('r4-map-popup')
		const popupButton = this.querySelector('r4-map-popup button')
		this.overlay = new Overlay({
			element: popup,
			autoPan: {
				animation: {
					duration: 250,
				},
			},
		})

		/**
		 * Add a click handler to hide the popup.
		 * @return {boolean} Don't follow the href.
		 */
		popupButton.onclick = () => {
			this.overlay.setPosition(undefined)
			popupButton.blur()
			return false
		}

		const rasterLayer = new TileLayer({
			source: new OSM(),
		})
		this.map = new Map({
			target: this.querySelector('main'),
			layers: [rasterLayer],
			view: new View({
				center: [this.longitude, this.latitude],
				zoom: this.longitude ? 6 : 2,
			}),
			overlays: [this.overlay],
		})

		// Sync map state with the URL
		if (this.url) {
			this.map.addInteraction(new Link())
		}

		this.map.on('singleclick', this.onClick.bind(this))

		// Handle hover aka pointermove on features
		const select = new Select({
			condition: click,
		})
		select.on('select', this.onSelect.bind(this))
		this.map.addInteraction(select)
	}

	createMarker(coordinate, details) {
		const feature = new Feature({
			geometry: new Point(coordinate),
			details,
		})
		const source = new VectorSource({features: [feature]})
		const circle = new Style({
			image: new Circle({
				radius: 6,
				stroke: new Stroke({
					color: 'black',
					width: 2,
				}),
				fill: new Fill({
					color: 'darkviolet',
				}),
			}),
		})
		const vectorLayer = new VectorLayer({source, style: [circle]})
		this.map.addLayer(vectorLayer)
		return vectorLayer
	}
	removeMarkers() {
		this.markers?.forEach((layer) => {
			this.map.removeLayer(layer)
		})
	}

	onClick(event) {
		const coordinate = event.coordinate
		this.clickedCoordinate = coordinate
		this.dispatchEvent(
			new CustomEvent('r4-map-click', {
				bubbles: true,
				detail: {
					longitude: event.coordinate[0],
					latitude: event.coordinate[1],
				},
			})
		)
	}

	onSelect(event) {
		const feature = event.selected[0]
		if (!feature) return
		const details = feature.get('details')
		if (details) {
			// Schedule a re-render so we see the clicked channel.
			this.channel = details
			const coordinate = [details.longitude, details.latitude]
			this.clickedCoordinate = coordinate
			this.overlay.setPosition(coordinate)
			this.requestUpdate()
		}
	}

	render() {
		return html`
			<main></main>
			<r4-map-popup class="ol-popup">
				<button class="ol-popup-closer">✖</button>
				<r4-popup-content>
					${this.channel ? this.renderChannel() : null}
					<code>${toStringHDMS(this.clickedCoordinate)}</code>
				</r4-popup-content>
			</r4-map-popup>
		`
	}

	renderChannel() {
		return html`<r4-channel-card
			origin=${this.channelOrigin}
			slug=${this.channel.slug}
			.channel=${this.channel}
		></r4-channel-card>`
	}

	createRenderRoot() {
		return this
	}
}

/**
 * Interesting examples for later
 * https://openlayers.org/en/latest/examples/box-selection.html
 */
