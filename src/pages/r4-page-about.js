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
		return html`<h1><r4-title></r4-title></h1>`
	}
	renderMain() {
		const {name: latestVersion} = this.latestTag
		return html`
			<p>
				The old or first version of R4 was live for ten years. Since April 2024 we've put it into <em>listen-only</em> mode on <a href="https://v1.radio4000.com">v1.radio4000.com</a>.
			</p>
			<p>You are now looking at the next x years:</p>
			<ul>
				<li>We are free of a few heavy tech dependencies like Google, Firebase and Facebook.</li>
				<li>Find exactly the tracks you want. Filter on tags, search queries, dates, sorting and all of it bookmarkable.</li>
				<li>Web components galore. Using the  the web platform</li>
				<li>And maybe the most important feature: we are now able to play with R4 again.</p>
			</ul>
			<p>We hope people will continue to share the music. Create a new account and radio - or migrate your existing one</strong>.</p>

			<h2>Contact</h2>
			<p>
					<a href="https://matrix.to/#/${this.roomAlias}" rel="noreferrer">
						Community chat
						<small>(${this.roomAlias})</small>
					</a>
			</p>
			<p><a href="mailto:contact@radio4000.com">contact@radio4000.com</a>.</p>

			<h2>Design & Development</h2>
			<p>
				Contribute to the design and development on
				<a href="https://github.com/radio4000" rel="noreferrer">github.com/radio4000</a>. The latest version is
				<a href=${this.releasesUrl}>${latestVersion ? latestVersion : '…'}</a>.
			</p>
			<p>Read the <a href="https://github.com/radio4000/publications/blob/main/user-agreement-privacy-policy-terms-of-use.md">privacy/terms</a>. See the <a href="https://blog.radio4000.com/">blog</a>.</p>
			<p>Cheers!</p>
			<p>
				<a href="${this.config.href}/">← back to the home page</a>
			</p>
		`
	}
}
