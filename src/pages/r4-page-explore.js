import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import {browse} from '../libs/browse'
import urlUtils from '../libs/url-utils'
import BaseChannels from './base-channels.js'

export default class R4PageExplore extends BaseChannels {
	renderMain() {
		if (this.channels) {
			return html` <r4-list> ${this.renderListItems()} </r4-list> `
		} else {
			return html` No channels yet.`
		}
	}

	renderListItems() {
		return repeat(
			this.channels || [],
			(c) => c.id,
			(c) => html`
				<r4-list-item>
					<r4-channel-card .channel=${c} origin=${this.channelOrigin}></r4-channel-card>
				</r4-list-item>
			`
		)
	}
}
