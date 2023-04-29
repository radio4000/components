import { LitElement, html } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';
import sdk from '@radio4000/sdk'
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

// simple passthrough of current href to CESIUM_BASE_URL
/* window.CESIUM_BASE_URL = window.location.href */
window.CESIUM_BASE_URL = '/static/Cesium/';

/**
 *
 */
export default class R4Map extends LitElement {
	static properties = {
		channels: { type: Array, state: true },
	}

	mapRef = createRef();

	initMap(containerEl) {
		console.log('containerEl', containerEl)

		const viewer = new Cesium.Viewer(containerEl, {
			terrainProvider: Cesium.createWorldTerrain()
		});

		const openTopoProvider = new Cesium.UrlTemplateImageryProvider({
			url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			credit: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> | <a href="https://opentopomap.org/about" target="_blank" rel="noopener">OpenTopoMap</a>'
		});

		viewer.imageryLayers.addImageryProvider(openTopoProvider);

		const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

		viewer.camera.flyTo({
			destination : Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 400),
			orientation : {
				heading : Cesium.Math.toRadians(0.0),
			},
		});

		return viewer
	}
	initRadioEntitiesLayer() {
		if (!this.channels || !this.viewer) return
		this.channels.forEach(channel => {
			console.log('channel', channel)
			const dataPoint = {"longitude":-122.39053,"latitude":37.61779,"height":-27.32}
			this.viewer.entities.add({
				description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
				position: Cesium.Cartesian3.fromDegrees(
					dataPoint.longitude,
					dataPoint.latitude,
					dataPoint.height
				),
				point: { pixelSize: 10, color: Cesium.Color.RED }
			});
		})
	}

	async willUpdate() {
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			this.channels = data.filter(c => c.longitude && c.latitude)
			console.log(this.channels)
		}
	}

	updated() {
		super.updated()
		const map = this.mapRef.value;
		if (map) {
			this.viewer = this.initMap(map)
			this.initRadioEntitiesLayer()
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
			<aside ${ref(this.mapRef)}></aside>
		`
	}

	createRenderRoot() {
		return this
	}
}
