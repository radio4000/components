import * as Cesium from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css"

// simple passthrough of current href to CESIUM_BASE_URL
/* window.CESIUM_BASE_URL = window.location.href */
window.CESIUM_BASE_URL = '/static/Cesium/';

const OSMImageryProviderOpenTopoURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

const mapCredit = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> | <a href="https://opentopomap.org/about" target="_blank" rel="noopener">OpenTopoMap</a>'

/* initialize a Cesium world map globe */
const initMap = async ({
	containerEl,
}) => {
	const terrainProvider = await Cesium.createWorldTerrainAsync()
	const viewer = new Cesium.Viewer(containerEl, {
		terrainProvider: terrainProvider,
		maximumZoomDistance: 1000
	})

	const openTopoProvider = new Cesium.UrlTemplateImageryProvider({
		url: OSMImageryProviderOpenTopoURL,
		credit: mapCredit,
	})

	viewer.imageryLayers.addImageryProvider(openTopoProvider)

	/* const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings()) */

	/* viewer.camera.flyTo({
		 destination : Cesium.Cartesian3.fromDegrees(3, 3),
		 orientation : {
		 heading : Cesium.Math.toRadians(0.0),
		 },
		 }); */

	return viewer
}

const initMapOnClick = ({
	viewer,
	callback,
}) => {
	viewer.screenSpaceEventHandler.setInputAction(
		callback,
		Cesium.ScreenSpaceEventType.LEFT_CLICK
	)
}

/* add radio channels, to a cesium layer */
const addChannels = ({
	channels = [],
	viewer,
}) => {
		if (!channels || !viewer) return
		channels.forEach(channel => {
			if (!channel.longitude || !channel.latitude ) return

			const radioEntity = viewer.entities.add({
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

const addNewChannel = ({
	viewer,
	longitude,
	latitude,
}) => {
	const entityId = 'channel-user-position'
	const entity = viewer.entities.getById(entityId)

	// if there is already a channel, remove its position
	if (entity) {
		viewer.entities.remove(entity)
	}

	const popupEntity = viewer.entities.add({
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
	})
}

const clickToCoordinates = ({
	event,
	viewer,
}) => {
	const cartesian = viewer.camera.pickEllipsoid(
		event.position,
		viewer.scene.globe.ellipsoid
	)
	if (!cartesian) return

	const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
	const longitude = Cesium.Math.toDegrees(cartographic.longitude)
	const latitude = Cesium.Math.toDegrees(cartographic.latitude)
	return {
		longitude,
		latitude,
	}
}

export {
	Cesium,
	initMap,
	initMapOnClick,
	addChannels,
	addNewChannel,
	clickToCoordinates,
}
