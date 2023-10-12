import {LitElement, html} from 'lit'
import page from 'page/page.mjs'

export default class R4PageNew extends LitElement {
	static properties = {
		store: {type: Object, state: true},
		config: {type: Object, state: true},
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
			<r4-page-header>
				<h1>Create radio channel</h1>
			</r4-page-header>
			<r4-page-main>
				<r4-channel-create @submit=${this.onChannelCreate}></r4-channel-create>
				<p>The slug is what will be used for the URL of your channel. You can always change it later.</p>
				<h2>Do you already have a radio from the old site?</h2>
				<p>You can import it with all the tracks <a href="https://migrate.radio4000.com">migrate.radio4000.com</a></p>
			</r4-page-main>
		`
	}

	onChannelCreate({detail: {data}}) {
		if (data) {
			page(`/${data.slug}`)
		}
	}

	createRenderRoot() {
		return this
	}
}
