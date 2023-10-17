import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageSearch extends R4Page {
	renderMain() {
		return html`<r4-channel-search href=${this.config.href}></r4-channel-search>`
	}
}
