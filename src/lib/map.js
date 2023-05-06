// import * as Cesium from 'cesium'
import {Viewer, Math as CesiumMath, VerticalOrigin, HeightReference, createWorldTerrainAsync, UrlTemplateImageryProvider, Cartesian2, Cartesian3, ScreenSpaceEventType, Color, LabelStyle} from 'cesium'
import "cesium/Build/Cesium/Widgets/widgets.css"

// simple passthrough of current href to CESIUM_BASE_URL
/* window.CESIUM_BASE_URL = window.location.href */
window.CESIUM_BASE_URL = '/static/Cesium/';

const newChannelEntityId = 'channel-user-new-position'
const originChannelEntityId = 'channel-user-origin-position'

const OSMImageryProviderOpenTopoURL = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

const mapCredit = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> | <a href="https://opentopomap.org/about" target="_blank" rel="noopener">OpenTopoMap</a>'

/* initialize a Cesium world map globe */
const initMap = async ({
	containerEl,
	longitude = null,
	latitude = null,
}) => {
	const terrainProvider = await createWorldTerrainAsync()
	const viewer = new Viewer(containerEl, {
		terrainProvider: terrainProvider,
		maximumZoomDistance: 10,
		selectionIndicator: true,
	})

	const openTopoProvider = new UrlTemplateImageryProvider({
		url: OSMImageryProviderOpenTopoURL,
		credit: mapCredit,
	})

	viewer.imageryLayers.addImageryProvider(openTopoProvider)

	/* const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings()) */

	if (longitude && latitude) {
		viewer.camera.flyTo({
			destination : Cartesian3.fromDegrees(longitude, latitude, 5000)
		});
	}

	return viewer
}

const initMapOnClick = ({
	viewer,
	callback,
}) => {
	viewer.screenSpaceEventHandler.setInputAction(
		callback,
		ScreenSpaceEventType.LEFT_CLICK
	)
}

const initOnChannelEntityClick = ({
	viewer,
	callback,
}) => {
	viewer.selectedEntityChanged.addEventListener(callback)
}

/* add radio channels, to a cesium layer */
const addChannels = ({
	channels = [],
	viewer,
	slug = null,
}) => {
	if (!channels || !viewer || !viewer.entities) return
	channels.forEach(channel => {
		if (!channel.longitude || !channel.latitude ) return

		const selected = slug === channel.slug

		const radioEntity = viewer.entities.add({
			name: channel.slug, // used as ID for click handler
			position: Cartesian3.fromDegrees(
				channel.longitude,
				channel.latitude
			),
			point: { pixelSize: 10, color: Color.RED },
			label: {
				text: `@${channel.slug}`,
				show: true,
				font: '1rem sans-serif',
				fillColor: Color.RED,
				backgroundColor: Color.PURPLE,
				outlineWidth: 3,
				style: LabelStyle.FILL_AND_OUTLINE,
				verticalOrigin: VerticalOrigin.BOTTOM,
				heightReference: HeightReference.CLAMP_TO_GROUND,
				pixelOffset: new Cartesian2(0, 10)
			},
		})

		if (selected) {
			viewer.selectedEntity = radioEntity
		}
	})
}

const addNewChannel = ({
	viewer,
	longitude,
	latitude,
}) => {
	const entityId = newChannelEntityId
	const entity = viewer.entities.getById(entityId)

	// if there is already a channel, remove its position
	if (entity) {
		viewer.entities.remove(entity)
	}

	const popupEntity = viewer.entities.add({
		position: Cartesian3.fromDegrees(longitude, latitude),
		id: entityId,
		label: {
			text: 'New position',
			show: true,
			font: '1rem sans-serif',
			fillColor: Color.PURPLE,
			outlineWidth: 3,
			style: LabelStyle.FILL_AND_OUTLINE,
			verticalOrigin: VerticalOrigin.BOTTOM,
			heightReference: HeightReference.CLAMP_TO_GROUND,
			pixelOffset: new Cartesian2(0, -15),
		},
		point: { pixelSize: 10, color: Color.PURPLE }
	})
}

const removeNewChannel = ({
	viewer,
}) => {
	const entityId = newChannelEntityId
	const entity = viewer.entities.getById(entityId)
	if (entity) {
		viewer.entities.remove(entity)
	}
}

/* channel origin is the origin channel position */
const addChannelOrigin = ({
	viewer,
	longitude,
	latitude,
}) => {
	const entityId = originChannelEntityId
	const entity = viewer.entities.getById(entityId)

	// if there is already a channel, remove its position
	if (entity) {
		viewer.entities.remove(entity)
	}

	const popupEntity = viewer.entities.add({
		position: Cartesian3.fromDegrees(longitude, latitude),
		id: entityId,
		label: {
			text: 'My position',
			show: true,
			font: '1rem sans-serif',
			fillColor: Color.RED,
			outlineWidth: 3,
			style: LabelStyle.FILL_AND_OUTLINE,
			verticalOrigin: VerticalOrigin.BOTTOM,
			heightReference: HeightReference.CLAMP_TO_GROUND,
			pixelOffset: new Cartesian2(0, -15),
		},
		point: { pixelSize: 10, color: Color.RED }
	})
}

const removeChannelOrigin = ({
	viewer,
}) => {
	const entityId = originChannelEntityId
	const entity = viewer.entities.getById(entityId)

	if (entity) {
		viewer.entities.remove(entity)
	}
}

const clickToCoordinates = ({
	event,
	viewer,
}) => {
	if (!event.position) return

	const cartesian = viewer.camera.pickEllipsoid(
		event.position,
		viewer.scene.globe.ellipsoid
	)
	if (!cartesian) return {}

	const cartographic = Cartographic.fromCartesian(cartesian)
	const longitude = CesiumMath.toDegrees(cartographic.longitude)
	const latitude = CesiumMath.toDegrees(cartographic.latitude)
	return {
		longitude,
		latitude,
	}
}

export {
	// Cesium,
	initMap,
	initMapOnClick,
	initOnChannelEntityClick,
	addChannels,
	addNewChannel,
	removeNewChannel,
	addChannelOrigin,
	removeChannelOrigin,
	clickToCoordinates,
}
