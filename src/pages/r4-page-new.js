import { LitElement, html } from 'lit'
import page from 'page/page.mjs'

export default class R4PageNew extends LitElement {
	static properties = {
		store: { type: Object, state: true },
		config: { type: Object, state: true },
	}

	connectedCallback() {
		super.connectedCallback()
		if (!this.store.user) {
			page(`/sign/in`)
		}
		if (this.store.userChannels) {
			page(`/${this.store.userChannels[0].slug}`)
		}
	}

	render() {
		return html`
			<main>
				<r4-channel-create @submit=${this.onChannelCreate}></r4-channel-create>
			</main>
		`
	}

	onChannelCreate({ detail: { data } }) {
		if (data) {
			page(`/${data.slug}`)
		}
	}

	createRenderRoot() {
		return this
	}
}
