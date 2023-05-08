import { html, LitElement } from 'lit'
import {sdk} from '@radio4000/sdk'

// Base class to extend from
export default class BaseChannel extends LitElement {
	static properties = {
		channel: { type: Object, state: true },
		canEdit: { type: Boolean, state: true },
		// from the router
		params: { type: Object, state: true },
		store: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/${this.channel.slug}`
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/{{id}}'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/{{id}}'
		}
	}

	willUpdate(changedProperties) {
		if (changedProperties.has('params')) {
			this.setChannel()
		}
	}

	// Set channel from the slug in the URL.
	async setChannel() {
		this.channel = (await sdk.channels.readChannel(this.params.slug)).data
		this.canEdit = await sdk.channels.canEditChannel(this.params.slug)
	}

	render() {
		return html``
	}
}
