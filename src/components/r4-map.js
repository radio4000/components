import { LitElement, html } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';
import {sdk} from '@radio4000/sdk'
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
			terrainProvider: Cesium.createWorldTerrain(),
			maximumZoomDistance: 1000
		});

		const openTopoProvider = new Cesium.UrlTemplateImageryProvider({
			url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			credit: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> | <a href="https://opentopomap.org/about" target="_blank" rel="noopener">OpenTopoMap</a>'
		});

		viewer.imageryLayers.addImageryProvider(openTopoProvider);

		const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

		/* viewer.camera.flyTo({
			 destination : Cesium.Cartesian3.fromDegrees(3, 3),
			 orientation : {
			 heading : Cesium.Math.toRadians(0.0),
			 },
			 }); */

		viewer.screenSpaceEventHandler.setInputAction(
			this.onMapClick.bind(this),
			Cesium.ScreenSpaceEventType.LEFT_CLICK
		)

		return viewer
	}

	onMapClick(event) {
		const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
		if (!cartesian) return

		const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
		const longitude = Cesium.Math.toDegrees(cartographic.longitude)
		const latitude = Cesium.Math.toDegrees(cartographic.latitude)

		const entityId = 'user-channe-position'
		const entity = this.viewer.entities.getById(entityId)

		if (entity) {
			this.viewer.entities.remove(entity)
		}

		const popupEntity = this.viewer.entities.add({
			position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
			id: entityId,
			label: {
				text: 'New channel',
				show: true,
				font: '1rem sans-serif',
				fillColor: Cesium.Color.PURPLE,
				outlineWidth: 3,
				style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
				pixelOffset: new Cesium.Cartesian2(0, -15),
			},
			point: { pixelSize: 10, color: Cesium.Color.PURPLE }
		});
	}

	initRadioEntitiesLayer() {
		if (!this.channels || !this.viewer) return
		this.channels.forEach(channel => {
			const radioEntity = this.viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(
					channel.longitude,
					channel.latitude
				),
				point: { pixelSize: 10, color: Cesium.Color.RED },
				label: {
					text: `@${channel.slug}`,
					show: true,
					font: '1rem sans-serif',
					fillColor: Cesium.Color.RED,
					backgroundColor: Cesium.Color.PURPLE,
					outlineWidth: 3,
					style: Cesium.LabelStyle.FILL_AND_OUTLINE,
					verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
					heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
					pixelOffset: new Cesium.Cartesian2(0, 10)
				},
			})
		})
	}

	async willUpdate() {
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			if (!data) return
			this.channels = data.filter(c => c.longitude && c.latitude)
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
