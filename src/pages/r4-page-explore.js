import {html} from 'lit'
import {repeat} from 'lit/directives/repeat.js'
import BaseChannels from './base-channels.js'

export default class R4PageExplore extends BaseChannels {
	renderMain() {
		if (this.data) {
			return html` <r4-list> ${this.renderListItems()} </r4-list> `
		} else {
			return html` No channels yet.`
		}
	}

	renderListItems() {
		return repeat(
			this.data || [],
			(c) => c.id,
			(c) => html`
				<r4-list-item>
					<r4-channel-card .channel=${c} origin=${this.channelOrigin}></r4-channel-card>
				</r4-list-item>
			`
		)
	}
}
