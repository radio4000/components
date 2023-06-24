import {LitElement, html} from 'lit'

export default class R4PageAbout extends LitElement {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
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
				<p>Hello. This is going to be the next version of Radio4000.<br>The current version is still live on <a href="https://radio4000.com">radio4000.com</a>.</p>
				<br>
				<p><em>&nbsp;&nbsp;&nbsp;Play around, test it out and come say hi in the <a href="https://matrix.to/#/#radio4000:matrix.org" rel="noreferrer">chat</a>.</em></p>
				<br>
				<p>Follow or help the design and development on <a href="https://github.com/radio4000">github.com/radio4000</a>.</p>
			</main>
		`
	}

	createRenderRoot() {
		return this
	}
}
