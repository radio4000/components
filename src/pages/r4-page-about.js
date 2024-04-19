import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageAbout extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
		latestTag: {type: Object, state: true},
	}
	roomAlias = '#radio4000:matrix.org'
	releasesUrl = 'https://github.com/radio4000/components/releases'

	constructor() {
		super()
		this.latestTag = {
			name: '',
		}
	}

	connectedCallback() {
		super.connectedCallback()
		this.fetchLatestRelease().then((latestTag) => {
			this.latestTag = latestTag
		})
	}

	async fetchLatestRelease() {
		const owner = 'radio4000'
		const repo = 'components'
		const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`)
		const data = await res.json()
		if (data?.length > 0) {
			const latestTag = data[0]
			return latestTag
		}
	}

	renderHeader() {
		return html`<h1>About <r4-title></r4-title></h1>`
	}
	renderMain() {
		const {name} = this.latestTag
		return html`
			<p>
				Hello. This is is the next version of <r4-title></r4-title>. The old, or first, version is still live on
				<a href="https://v1.radio4000.com">v1.radio4000.com</a>; it is in read-only mode. Here you can freely import
				your existing radio channel, test it with the new features.
			</p>
			<p>
				<strong
					>Come say hi in the
					<a href="https://matrix.to/#/${this.roomAlias}" rel="noreferrer">
						community chat
						<small>(${this.roomAlias})</small>
					</a>
				</strong>
			</p>
			<p>Prefer mail? Write us at <a href="mailto:contact@radio4000.com">contact@radio4000.com</a>.</p>
			<p>
				Contribute to the design and development on <a href="https://github.com/radio4000">github.com/radio4000</a>.
			</p>
			<p>The latest version is <a href=${this.releasesUrl}>${name ? name : '…'}</a>.</p>
			<p>Read the <a href="https://blog.radio4000.com/" rel="noreferrer">blog</a></p>
			<p>Cheers!</p>
			<p>
				<a href="${this.config.href}/">← back to the home page</a>
			</p>
		`
	}
}
