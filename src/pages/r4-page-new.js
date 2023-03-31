import { LitElement, html } from 'lit'
import page from 'page/page.mjs'

export default class R4PageNew extends LitElement {
	render() {
		return html`
			<main>
				<r4-channel-create
					@submit=${this.onChannelCreate}
				></r4-channel-create>
			</main>
		`
	}

	onChannelCreate({detail: {data}}) {
		console.log('some times data is null here', data)
		page(`/${data.slug}`)
	}

	createRenderRoot() {
		return this
	}
}
