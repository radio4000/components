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
		slug: { type: String },
		longitude: { type: Number },
		latitude: { type: Number },
		href: { type: String },
	}

	get channelOrigin() {
		const href = this.href || window.location
		return `${href}/{{slug}}`
	}

	mapRef = createRef();

	async initMap({containerEl}) {
		const viewer = await lib.map.initMap({
			containerEl,
			longitude: this.longitude,
			latitude: this.latitude
		})
		viewer.selectedEntityChanged.addEventListener(this.onChannelClick.bind(this))
		return viewer
	}

	onChannelClick = (selectedEntity) => {
		if (lib.map.Cesium.defined(selectedEntity)) {
			if (lib.map.Cesium.defined(selectedEntity.name)) {
				this.slug = selectedEntity.name
			}
		} else {
			this.slug = null
		}
	}

	async willUpdate() {
		if (!this.channels) {
			const {data} = await sdk.channels.readChannels()
			if (!data) return
			this.channels = data.filter(c => c.longitude && c.latitude)
		}
	}

	async updated() {
		super.updated()
		const $map = this.mapRef.value;
		if ($map && !this.viewer) {
			this.viewer = await this.initMap({
				containerEl: $map
			})
			lib.map.addChannels({
				channels: this.channels,
				viewer: this.viewer,
				slug: this.slug
			})
		}
	}

	render() {
		if (!this.channels) return html`<p>Loading...</p>`

		return html`
			<main ${ref(this.mapRef)}></main>
			${this.renderSelectedChannel()}
		`
	}
	renderSelectedChannel() {
		if (!this.slug || !this.channelOrigin) return
		return html`
			<aside>
				<r4-channel
					origin=${this.channelOrigin}
					slug=${this.slug}
					></r4-channel>
			</aside>
		`
	}

	createRenderRoot() {
		return this
	}
}
