import {html} from 'lit'
import BaseChannels from './base-channels.js'

export default class R4PageSearch extends BaseChannels {
	renderMain() {
		return html`<r4-channel-search href=${this.config.href}></r4-channel-search>`
	}
}
