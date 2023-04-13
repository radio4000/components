import { html, LitElement } from 'lit'
import { canEditChannel, readChannel } from '@radio4000/sdk'

// Base class to extend from
export class ChannelPage extends LitElement {
	static properties = {
		channel: { type: Object, state: true },
		canEdit: { type: Boolean, state: true },
		// from the router
		params: { type: Object, state: true },
		store: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	get channelOrigin() {
		return this.config.singleChannel ? this.config.href : `${this.config.href}/{{slug}}`
	}

	get tracksOrigin() {
		if (this.config.singleChannel) {
			return this.config.href + '/tracks/{{id}}'
		} else {
			return this.config.href + '/' + this.params.slug + '/tracks/{{id}}'
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.setChannel()
	}

	// Set channel from the slug in the URL.
	async setChannel() {
		this.channel = (await readChannel(this.params.slug)).data
		this.canEdit = await canEditChannel(this.params.slug)
	}

	render() {
		return html``
	}
}
