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
			page(`/sign/up`)
		}
		if (this.store.userChannels?.length) {
			page(`/${this.store.userChannels[0].slug}`)
		}
	}

	renderHeader() {
		return html`
			<menu>
				<li>
					<h1><a href=${this.config.href}>New radio channel</a></h1>
				</li>
			</menu>
		`
	}
	renderMain() {
		return html`
			<section>
				<header>
					<p>To create a new <r4-title></r4-title> channel, choose a radio name.</p>
					<p><i>(The name can be changed later)</i></p>
				</header>
				<r4-channel-create @submit=${this.onChannelCreate} href=${this.config.href}></r4-channel-create>
			</section>
			<section>
				<dialog open inline>
					<h2>Import existing radio from v1?</h2>
					<p>
						To import a radio channel from the version 1 website, don't create a new radio channel.
					</p>
					<p>
						Visit the page <a href="${this.config.hrefMigrate}"><strong>${new URL(this.config.hrefMigrate).hostname}</strong></a> and follow the steps (using your v1 and v2 accounts).
					</p>
					<form method="dialog" part="form">
						<button part="button" formmethod="dialog">Close</button>
					</form>
				</dialog>
			</section>
		`
	}

	onChannelCreate({detail: {data}}) {
		if (data) {
			page(`/${data.slug}`)
		}
	}
}
