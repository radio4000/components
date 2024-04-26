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
					<p>To create a new <r4-title></r4-title> channel, choose a radio name (it can always be changed later).</p>
				</header>
				<r4-channel-create @submit=${this.onChannelCreate} href=${this.config.href}></r4-channel-create>
			</section>
			<section>
				<dialog open inline>
					<h2>Import radio from v1?</h2>
					<p>
						Visit
						<a href="${this.config.hrefMigrate}"><strong>${new URL(this.config.hrefMigrate).hostname}</strong></a> to
						import the existing radio channel.
					</p>
					<p>If you are new here, nevermind that notice and welcome!</p>
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
