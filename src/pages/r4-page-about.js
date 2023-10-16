import {html} from 'lit'
import R4Page from '../components/r4-page.js'

export default class R4PageAbout extends R4Page {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
		latestTag: {type: Object, state: true},
	}

	connectedCallback() {
		super.connectedCallback()
		this.yolo()
	}

	async yolo() {
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
			<p>Hello. This is going to be the next version of Radio4000.</p>
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
					<a href="https://matrix.to/#/#radio4000:matrix.org" rel="noreferrer">community chat</a>.</strong
				>
			</p>
			<p>
				Contribute to the design and development on <a href="https://github.com/radio4000">github.com/radio4000</a>. The
				latest version is ${this.latestTag?.name}.
			</p>
		`
	}

	createRenderRoot() {
		return this
	}
}
