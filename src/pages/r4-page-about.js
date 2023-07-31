import {LitElement, html} from 'lit'

export default class R4PageAbout extends LitElement {
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

	render() {
		return html`
			<header>
				<nav>
					<nav-item><code>/</code>about</nav-item>
				</nav>
			</header>

			<main>
				<h1 style="margin-bottom:0">About</h1>
				<p>
					Hello. This is going to be the next version of Radio4000.<br />The current version is still live on
					<a href="https://radio4000.com">radio4000.com</a>.
				</p>
				<br />
				<p>
					<strong
						>Play around, test it out and come say hi in the
						<a href="https://matrix.to/#/#radio4000:matrix.org" rel="noreferrer">chat</a>.</strong
					>
				</p>
				<br />
				<p>
					Contribute to the design and development on <a href="https://github.com/radio4000">github.com/radio4000</a>.
					The latest version is ${this.latestTag?.name}.
				</p>
			</main>
		`
	}

	createRenderRoot() {
		return this
	}
}
