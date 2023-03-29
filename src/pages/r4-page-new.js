import { LitElement, html } from 'lit'
import page from 'page/page.mjs'

export default class R4PageNew extends LitElement {
	static properties = {
		href: { type: String, reflect: true },
	}

	render() {
		return html`
			<main>
				<r4-channel-create
					@submit=${this.onChannelCreate}
				></r4-channel-create>
			</main>
		`
	}

	onChannelCreate(
		{
			detail: {
				data
			}
		}
	) {
		page(`/${data.slug}`)
	}
	createRenderRoot() {
		return this
	}
}
