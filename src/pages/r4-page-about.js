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

	connectedCallback() {
		super.connectedCallback()
		this.fetchTheLatestTagFromTheGitProviderRepoUrlAndSetLatestTag()
	}

	async fetchTheLatestTagFromTheGitProviderRepoUrlAndSetLatestTag() {
		const owner = 'radio4000'
		const repo = 'components'
		const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`)
		const data = await res.json()
		if (data?.length > 0) {
			this.latestTag = data[0]
		}
	}

	renderHeader() {
		return html`<h1>About</h1>`
	}
	renderMain() {
		return html`
			<p>Hello. This is going to be the next version of <r4-title></r4-title>.</p>
			<p>
				The current version is still live on
				<a href="https://radio4000.com">radio4000.com</a>; keep using it normally, until the beta is ready to replace
				it.
			</p>
			<p>
				On the beta, you can freely import your existing radio channel, test it with the new features; delete it and
				start again.
			</p>
			<p>
				<strong
					>Play around, test it out and come say hi in the
					<a href="https://matrix.to/#/${this.roomAlias}" rel="noreferrer">
						community chat
						<small>(${this.roomAlias})</small>
					</a>
					.</strong
				>
			</p>
			<p>
				Contribute to the design and development on <a href="https://github.com/radio4000">github.com/radio4000</a>.
			</p>
			<p>The latest version is <a href=${this.releasesUrl}>${this.latestTag?.name}</a>.</p>
			<p>Cheers!</p>
			<p>
				<a href="${this.config.href}">← back to the home page</a>
			</p>
		`
	}
}
