import {LitElement, html} from 'lit'
import {sdk} from '@radio4000/sdk'

import 'ol/ol.css'
import {Map, View, Feature} from 'ol'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import TileLayer from 'ol/layer/Tile'
import {Point} from 'ol/geom'
import {Select} from 'ol/interaction'
import Link from 'ol/interaction/Link.js'
import {pointerMove} from 'ol/events/condition'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Circle from 'ol/style/Circle'
import {transform, useGeographic} from 'ol/proj'

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

		// Optional, initial map position
		longitude: {type: Number},
		latitude: {type: Number},

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
	}

	get channelOrigin() {
		const href = this.href || window.location
		return `${href}/{{slug}}`
	}

	async firstUpdated() {
		this.createMap()
		this.isReady = true

		// Fetch channels and set markers for each.
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			if (!data) return
			this.channels = data.filter((c) => c.longitude && c.latitude)
			this.channels.forEach((c) => this.addMarker([c.longitude, c.latitude], c))
		}
	}

	createMap() {
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
		})

		// Sync map state with the URL
		if (this.url) {
			this.map.addInteraction(new Link())
		}

		this.map.on('click', this.onClick.bind(this))

		// Handle hover aka pointermove on features
		const select = new Select({
			condition: pointerMove,
		})
		select.on('select', this.onSelect.bind(this))
		this.map.addInteraction(select)
	}

	addMarker(coordinate, details) {
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
					color: '#ffcd46',
				}),
			}),
		})
		const vectorLayer = new VectorLayer({source, style: [circle]})
		this.map.addLayer(vectorLayer)
	}

	onClick(event) {
		this.addMarker(event.coordinate)
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
			this.requestUpdate()
		}
	}

	render() {
		return html`
			<main></main>
			<aside>
				${this.channel
					? html`<r4-channel
							origin=${this.channelOrigin}
							slug=${this.channel.slug}
							.channel=${this.channel}
					  ></r4-channel>`
					: null}
			</aside>
		`
	}

	createRenderRoot() {
		return this
	}
}

/**
 * Interesting examples for later
 * https://openlayers.org/en/latest/examples/box-selection.html
 */
