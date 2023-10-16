import {html, LitElement} from 'lit'
import {sdk} from '@radio4000/sdk'
import R4Page from '../components/r4-page.js'

// Base class to extend from
export default class BaseChannel extends R4Page {
	static properties = {
		channel: {type: Object, state: true},
		tracks: {type: Array, state: true},
		channelError: {type: Object, state: true},
		canEdit: {type: Boolean, state: true, reflect: true},
		alreadyFollowing: {type: Boolean, state: true, reflect: true},
		followsYou: {type: Boolean, state: true, reflect: true},
		isFirebaseChannel: {type: Boolean},

		// from the router
		params: {type: Object, state: true},
		store: {type: Object, state: true},
		config: {type: Object, state: true},
		searchParams: {type: Object, state: true},
	}

	get slug() {
		return this.config.singleChannel ? this.config.selectedSlug : this.params.slug
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/${this.params.slug}`
	}

	get tracksOrigin() {
		const {singleChannel, href} = this.config
		return singleChannel ? `${href}/tracks/` : `${href}/${this.params.slug}/tracks/`
	}

	get alreadyFollowing() {
		if (!this.store.user) return false
		return this.store.followings?.map((c) => c.slug).includes(this.channel?.slug)
	}

	get followsYou() {
		if (!this.store.user) return false
		return this.store.followers?.map((c) => c.slug).includes(this.config.selectedSlug)
	}

	get hasOneChannel() {
		if (!this.store.user) return false
		return this.store?.userChannels?.length === 1 ? true : false
	}

	async willUpdate(changedProperties) {
		if (changedProperties.has('params')) {
			await this.setChannel()
		}
	}
	async connectedCallback() {
		super.connectedCallback()
		if (!this.channel) {
			await this.setChannel()
		}
	}

	// Set channel from the slug in the URL.
	async setChannel() {
		const slug = this.config.singleChannel && this.config.selectedSlug ? this.config.selectedSlug : this.params.slug

		// No need to set again if channel the same channel is loaded.
		if (this.channel?.slug === slug) return

		const {data, error} = await sdk.channels.readChannel(slug)
		this.canEdit = await sdk.channels.canEditChannel(slug)

		if (error) {
			try {
				const res = await fetch('https://radio4000.firebaseio.com/channels.json?orderBy="slug"&equalTo="' + slug + '"')
				const list = await res.json()
				this.isFirebaseChannel = Object.keys(list).length > 0
			} catch (e) {
				//
			}
			if (!this.isFirebaseChannel) {
				this.channelError = error
			}
		} else {
			this.isFirebaseChannel = false
			this.channel = data
		}
	}
	createRenderRoot() {
		return this
	}
}
