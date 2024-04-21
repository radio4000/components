import {html} from 'lit'
import page from 'page/page.mjs'
import R4Page from '../components/r4-page.js'

export default class R4PageNew extends R4Page {
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

	renderHeader() {
		return html` `
	}
	renderMain() {
		return html`
			<h2>Do you already have a radio from the old site?</h2>
			<p>1. Create a new account below.<br>
			2. Follow the steps on <a href="https://migrate.radio4000.com"><strong>migrate.radio4000</strong></a> &larr; it'll only take a minute (<a href="${this.config.href}/about">about</a>).</p>
			<p>If you are new here, nevermind that notice and welcome!</p>

			<h1>Create radio channel</h1>
			<r4-channel-create @submit=${this.onChannelCreate}></r4-channel-create>
			<p>The slug is what will be used for the URL of your channel. You can always change it later.</p>
		`
	}

	onChannelCreate({detail: {data}}) {
		if (data) {
			page(`/${data.slug}`)
		}
	}
}
