import { LitElement, html } from 'lit'
import {ref, createRef} from 'lit/directives/ref.js';
import {sdk} from '@radio4000/sdk'
import lib from '../lib/'

/**
 * a world globe with all radio channels with coordinates
 */
export default class R4Map extends LitElement {
	static properties = {
		channels: { type: Array, state: true },
	}

	mapRef = createRef();

	initMap({containerEl}) {
		this.viewer = lib.map.initMap({containerEl})
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

	async willUpdate() {
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			if (!data) return
			this.channels = data.filter(c => c.longitude && c.latitude)
		}
	}

	updated() {
		super.updated()
		const $map = this.mapRef.value;
		if ($map) {
			this.viewer = lib.map.initMap({
				containerEl: $map
			})
			lib.map.addChannels({
				channels: this.channels,
				viewer: this.viewer,
			})
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
