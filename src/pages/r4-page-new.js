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
		if (this.store.userChannels?.length) {
			page(`/${this.store.userChannels[0].slug}`)
		}
	}

	render() {
		return html`
			<main>
				<h1>Create radio channel</h1>
				<r4-channel-create @submit=${this.onChannelCreate}></r4-channel-create>
				<p>The slug is what will be used for the URL of your channel. You can always change it later.</p>
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
