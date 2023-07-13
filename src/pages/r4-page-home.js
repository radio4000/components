import {LitElement, html} from 'lit'

export default class R4PageHome extends LitElement {
	static properties = {
		config: {type: Object, state: true},
		store: {type: Object, state: true},
	}

	render() {
		const {href} = this.config
		const {user, userChannels, following} = this.store
		return html`
			<header>
				<nav>
					<nav-item><code>/</code></nav-item>
				</nav>
			</header>

			<main>
				<h1 style="margin-bottom:0">Radio4000 b3t4</h1>
				<p>
					This is the public beta for a new Radio4000. Try it out! (<a href=${href + `/about`}>what's this?</a>)
				</p>
				<br/>
				<p><strong>WARNING &rarr;</strong> any data created here will be deleted while we're in beta.<br>This is a playground to test everything.</p>
				${user ? this.renderMenuUser() : null}
				${userChannels?.length
					? html`
							<section>
								<h2>Your channel${userChannels?.length > 1 ? 's' : ''}</h2>
								<ul list>
									${userChannels.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
				${following?.length
					? html`
							<section>
								<h2>Following</h2>
								<ul list>
									${following?.map((channel) => this.renderChannelCard(channel, href))}
								</ul>
							</section>
					  `
					: null}
			</main>
		`
	}

	renderChannelCard(channel) {
		const channelOrigin = `${this.config.href}/${channel.slug}`
		return html` <li>
			<r4-channel-card .channel=${channel} origin=${channelOrigin}></r4-channel-card>
		</li>`
	}

	renderMenuUser() {
		return html``
	}

	createRenderRoot() {
		return this
	}
}
